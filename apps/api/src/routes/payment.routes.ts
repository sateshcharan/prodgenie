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

router.post(
  apiRoutes.payment.registerManualQRPayment,
  PaymentController.registerManualQRPayment
);

// PhonePe
router.post(
  apiRoutes.payment.phonepeCreate,
  PaymentController.createPhonePePayment
);

router.get(
  apiRoutes.payment.phonepeRedirect,
  PaymentController.phonePeRedirect
);

router.post(
  apiRoutes.payment.phonepeCallback,
  PaymentController.phonePeCallback
);

router.get('/phonepe/status/:orderId', PaymentController.getPhonePeStatus);

export { router };
