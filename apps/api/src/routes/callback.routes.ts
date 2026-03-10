import express, { Router, raw } from 'express';

import { prisma } from '@prodgenie/libs/db';

import { AuthController } from '../controllers/auth.controller';
import { PaymentController } from '../controllers/payment.controller';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';

const router: Router = Router();

// === OAuth ===
router.get('/OAuth', asyncHandler(AuthController.OAuthCallback));

// === Stripe ===
router.post(
  '/stripe',
  raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhook
);

// // === PhonePe ===
// router.post('/phonepe/callback', async (req, res) => {
//   console.log('PhonePe callback:', req.body);
//   // verify signature and update order status
//   res.status(200).send('OK');
// });

// === Reactivate Account ===
router.post('/reactivate', asyncHandler(AuthController.reactivateAccount));

export { router };
