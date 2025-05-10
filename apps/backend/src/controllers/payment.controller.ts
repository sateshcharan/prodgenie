import { Request, Response } from 'express';
import { StripeService } from '../services/stripe.service';
import { UpiService } from '../services/upi.service';

export const PaymentController = {
  async createStripeSession(req: Request, res: Response) {
    const { email, priceId } = req.body;
    const session = await StripeService.createCheckoutSession(email, priceId);
    res.json({ url: session.url });
  },

  // async createUpiOrder(req: Request, res: Response) {
  //   const { amount, receipt } = req.body;
  //   const order = await UpiService.createOrder(amount, receipt);
  //   res.json(order);
  // },
};
