import { randomUUID, UUID } from 'crypto';

import { EventService } from '@prodgenie/libs/db';
import { prisma } from '@prodgenie/libs/db/lib/prismaClient';
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
          type: 'manual_topup',
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
}
