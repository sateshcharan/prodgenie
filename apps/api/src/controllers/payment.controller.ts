import { Request, Response } from 'express';

import { StripeService, PhonePeService } from '../services';

export const PaymentController = {
  // === Stripe ===
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

  // === PhonePe ===
  async createPhonePePayment(req: Request, res: Response) {
    const { orderId, amount, mobile, name } = req.body;
    const response = await PhonePeService.createPayment(
      orderId,
      amount,
      mobile,
      name
    );
    res.json(response);
    console.log(response);
  },

  async getPhonePeStatus(req: Request, res: Response) {
    const { orderId } = req.params;
    const response = await PhonePeService.verifyPayment(orderId);
    res.json(response);
  },
};
