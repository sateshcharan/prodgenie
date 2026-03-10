import { Request, Response, NextFunction } from 'express';

// import { StripeService, PhonePeService } from '../services';
import { StripeService } from '@prodgenie/libs/server-services/lib/payment/stripe.service';
import { PaymentService } from '../services/payment.service';

// export const PaymentController = {

//   // === PhonePe ===
//   async createPhonePePayment(req: Request, res: Response) {
//     const { orderId, amount, mobile, name } = req.body;

//     const response = await PhonePeService.createPayment(
//       orderId,
//       amount,
//       mobile,
//       name
//     );

//     console.log('PhonePe Payment Response:', response);

//     res.json(response);
//   },

//   async phonePeRedirect(req: Request, res: Response) {
//     const { orderId } = req.params;

//     const response = await PhonePeService.verifyPayment(orderId);

//     // update workspace credits or (plan, period)

//     res.redirect(`${process.env.WEB_URL}/phonepe/success?orderId=${orderId}`);
//   },

//   async getPhonePeStatus(req: Request, res: Response) {
//     const { orderId } = req.params;

//     const response = await PhonePeService.verifyPayment(orderId);
//     res.json(response);
//   },
// };

export const PaymentController = {
  // === Stripe ===
  async createStripeSession(req: Request, res: Response) {
    const workspaceId = req.activeWorkspaceId!;
    const { email, planId } = req.body;

    const session = await StripeService.createCheckoutSession(
      email,
      workspaceId,
      planId
    );
    return res.status(200).json(session);
  },

  async handleStripeWebhook(req: Request, res: Response) {
    await StripeService.processEvent(req);
  },

  async createPhonePePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantOrderId, amount, mobile, name } = req.body;
      const workspaceId = req.activeWorkspaceId;
      const userId = req.user?.id;

      const amountPaise = Math.round(amount * 100);
      const { payment, phonepeResp } = await PaymentService.createPhonePeOrder({
        merchantOrderId,
        workspaceId,
        userId,
        amountPaise,
        meta: { mobile, name },
      });

      return res.status(200).json({ payment, phonepe: phonepeResp });
    } catch (err) {
      next(err);
    }
  },

  // PhonePe redirect - user-facing only. Do NOT trust this alone.
  phonePeRedirect(req: Request, res: Response) {
    const merchantOrderId = String(
      req.query.merchantOrderId ??
        req.query.orderId ??
        req.query.merchantorderid ??
        ''
    );

    return res.redirect(
      `${process.env.WEB_URL}/phonepe/result?orderId=${encodeURIComponent(
        merchantOrderId
      )}`
    );
  },

  // Callback from PhonePe (server-to-server)
  async phonePeCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const callbackBody = req.body;
      await PaymentService.handleCallbackAndRespond(callbackBody);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('PhonePe callback error', err);
      return res.status(500).json({ success: false });
    }
  },

  async getPhonePeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const updated = await PaymentService.verifyAndFinalize(orderId);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};
