import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router: Router = Router();

router.post('/stripe/session', PaymentController.createStripeSession);
// router.post('/upi/order', PaymentController.createUpiOrder);

export { router };
