import { Router, raw } from 'express';

import { apiRoutes } from '@prodgenie/libs/constant';

import { PaymentController } from '../controllers/payment.controller';

const router: Router = Router();

// Stripe
router.post(
  apiRoutes.payment.stripeSession,
  PaymentController.createStripeSession
);
router.post(
  '/stripe/webhook',
  raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhook
);

// PhonePe
router.post(
  apiRoutes.payment.phonepeCreatePayment,
  PaymentController.createPhonePePayment
);
router.get('/phonepe/status/:orderId', PaymentController.getPhonePeStatus);

export { router };
