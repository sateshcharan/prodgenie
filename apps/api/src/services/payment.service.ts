import { randomUUID, UUID } from 'crypto';

import { prisma } from '@prodgenie/libs/db';
import { EventService } from '@prodgenie/libs/db';
import { PhonePeService } from '@prodgenie/libs/server-services/lib/payment/phonepe.service';

export class PaymentService {
  static async createPhonePeOrder({
    merchantOrderId,
    workspaceId,
    userId,
    amountPaise,
    meta,
  }: {
    merchantOrderId: string;
    workspaceId?: UUID;
    userId?: UUID;
    amountPaise: number;
    meta?: object;
  }) {
    //create DB record as pending
    const payment = await prisma.payment.create({
      data: {
        merchantOrderId,
        workspaceId,
        userId,
        amount: amountPaise,
        provider: 'phonepe',
        status: 'pending',
        meta: meta ?? {},
      },
    });

    //call PhonePe
    const phonepeResp = await PhonePeService.createPayment(
      merchantOrderId,
      amountPaise,
      meta?.mobile,
      meta?.name
    );

    //persist providerOrderId if available
    const providerOrderId = phonepeResp.raw?.orderId ?? null;
    await prisma.payment.update({
      where: { merchantOrderId },
      data: { providerOrderId },
    });

    return { payment, phonepeResp };
  }

  // verify+finalize - idempotent
  static async verifyAndFinalize(merchantOrderId: string) {
    const db = await prisma.payment.findUnique({ where: { merchantOrderId } });
    if (!db) throw new Error('Payment record not found');

    if (db.status === 'completed') return db;

    const resp = await PhonePeService.verifyPayment(merchantOrderId);
    const state = (resp?.state || '').toUpperCase();

    if (state === 'COMPLETED' || state === 'SUCCESS') {
      return prisma.$transaction(async (tx) => {
        const updated = await tx.payment.update({
          where: { merchantOrderId },
          data: {
            status: 'completed',
            providerOrderId: resp.orderId ?? db.providerOrderId,
            meta: { ...db.meta, verification: resp },
            transactionAt: resp?.transactionTime
              ? new Date(resp.transactionTime)
              : new Date(),
          },
        });

        // e.g. credit workspace
        // await GrantService.applyPaymentToWorkspace(db.workspaceId, db.amount);
        await tx.workspace.update({
          where: { id: db.workspaceId },
          data: {
            credits: {
              increment: db.amount / 100,
            },
          },
        });

        await EventService.recordTx(tx, {
          workspaceId: db.workspaceId,
          userId: db.userId,
          status: 'completed',
          id: randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          creditChange: +db.amount / 100,
          type: 'credit_topup',
          balanceAfter: +db.amount / 100,
          progress: 100,
          errorData: {},
          fileId: null,
        });

        return updated;
      });
    }

    return await prisma.payment.update({
      where: { merchantOrderId },
      data: {
        status: state.toLowerCase(),
        meta: { ...db.meta, verification: resp },
        verification: resp,
      },
    });
  }

  static async handleCallbackAndRespond(callbackBody: any) {
    // PhonePe will post callback with merchantOrderId etc.
    // Pull merchantOrderId from payload, verify by server-side getOrderStatus
    const merchantOrderId =
      callbackBody?.merchantOrderId ??
      callbackBody?.merchantorderid ??
      callbackBody?.orderId;

    if (!merchantOrderId) {
      throw new Error('missing merchantOrderId in callback');
    }

    // Verify & finalize (idempotent)
    const updated = await this.verifyAndFinalize(merchantOrderId);
    return updated;
  }

  static async registerManualQRPayment(
    workspaceId: string,
    userId: string,
    amount: number,
    transactionId: string,
    purpose: string
  ) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          workspaceId,
          userId,
          amount: amount * 100, // convert to paise
          provider: 'manual_qr',
          status: 'update_credits_manually',
          providerOrderId: transactionId,
          transactionAt: new Date(),
          meta: { manual: true, purpose },
        },
      });

      await EventService.recordTx(tx, {
        workspaceId,
        userId,
        status: 'update_credits_manually',
        id: randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        creditChange: +payment.amount / 100,
        type: purpose,
        description: `${transactionId} will be verified and credits will be updated`,
        // balanceAfter: +payment.amount / 100, // amount shown as automatically updated
        progress: 50,
        errorData: {},
        fileId: null,
      });
    });
  }
}
