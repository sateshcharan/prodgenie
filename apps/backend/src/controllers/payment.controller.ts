import { Request, Response } from 'express';

import { StripeService, UpiService, InstamojoService } from '../services';

export const PaymentController = {
  async createStripeSession(req: Request, res: Response) {
    const orgId = req.user?.org?.id;
    const { email, priceId } = req.body;
    const session = await StripeService.createCheckoutSession(
      email,
      orgId,
      priceId
    );
    res.json(session);
  },

  async handleStripeWebhook(req: Request, res: Response) {
    await StripeService.processEvent(req);
  },

  async createUpiOrder(req: Request, res: Response) {
    const { amount, receipt } = req.body;
    const order = await UpiService.createOrder(amount, receipt);
    res.json(order);
  },

  async createInstamojoPayment(req: Request, res: Response) {
    const { amount, purpose, email, redirectUrl } = req.body;
    const payment = await InstamojoService.createPaymentRequest(
      amount,
      purpose,
      email,
      redirectUrl
    );
    res.json(payment);
  },

  async getInstamojoPaymentStatus(req: Request, res: Response) {
    const { paymentRequestId } = req.params;
    const status = await InstamojoService.getPaymentStatus(paymentRequestId);
    res.json(status);
  },
};
