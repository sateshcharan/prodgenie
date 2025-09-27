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

// Instamojo
router.post('/instamojo/payment', PaymentController.createInstamojoPayment);
router.get(
  '/instamojo/status/:paymentRequestId',
  PaymentController.getInstamojoPaymentStatus
);

router.post(apiRoutes.payment.upiOrder, PaymentController.createUpiOrder);

export { router };
