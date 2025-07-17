import { Request, Response } from 'express';

import { StripeService, UpiService } from '../services';

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
};
