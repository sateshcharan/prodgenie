import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = Router();

router.post(
  apiRoutes.payment.stripeSession,
  PaymentController.createStripeSession
);
// router.post(apiRoutes.payment.upiOrder, PaymentController.createUpiOrder);

export { router };
