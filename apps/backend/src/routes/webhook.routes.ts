import { Router, raw } from 'express';

import { PaymentController } from '../controllers/payment.controller';

const router: Router = Router();

router.post(
  '/stripe',
  raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhook
);

export { router };
