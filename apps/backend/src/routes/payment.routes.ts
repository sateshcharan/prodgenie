import { Router, raw } from 'express';

import { PaymentController } from '../controllers/payment.controller';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = Router();

router.post(
  apiRoutes.payment.stripeSession,
  PaymentController.createStripeSession
);
router.post(apiRoutes.payment.upiOrder, PaymentController.createUpiOrder);

router.post(
  '/stripe/webhook',
  raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhook
);

export { router };
