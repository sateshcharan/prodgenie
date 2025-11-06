import { Router, raw } from 'express';
import express from 'express';

import { PaymentController } from '../controllers/payment.controller';

import { prisma } from '@prodgenie/libs/prisma';
import { AuthController } from '../controllers';
import { asyncHandler } from '../middlewares';

const router: Router = Router();

// === OAuth ===
router.get('/oAuth', asyncHandler(AuthController.oAuthCallback));

// // === PhonePe ===
// router.post('/phonepe/callback', async (req, res) => {
//   console.log('PhonePe callback:', req.body);
//   // verify signature and update order status
//   res.status(200).send('OK');
// });

// // === Stripe ===
// router.post(
//   '/stripe',
//   raw({ type: 'application/json' }),
//   PaymentController.handleStripeWebhook
// );

export { router };
