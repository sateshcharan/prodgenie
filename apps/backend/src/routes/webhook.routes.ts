import { Router, raw } from 'express';
import express from 'express';

import { PaymentController } from '../controllers/payment.controller';

import { prisma } from '@prodgenie/libs/prisma';

const router: Router = Router();

router.post(
  '/stripe',
  raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhook
);

// router.post('/user', express.json(), async (req, res) => {
//   const { type, record } = req.body;
//   const { id, email, raw_user_meta_data } = record;
//   const { name } = raw_user_meta_data;

//   if (type === 'INSERT') {
//     await prisma.user.create({
//       data: {
//         id, // use Supabase UID
//         email,
//         name,
//       },
//     });
//   }

//   res.status(200).send('ok');
// });

router.post('/user', express.json(), async (req, res) => {
  try {
    const { type, record } = req.body;
    const { id, email, raw_user_meta_data } = record;
    const name = raw_user_meta_data?.name ?? null;

    if (type === 'INSERT') {
      await prisma.user.upsert({
        where: { id },
        update: { email, name },
        create: { id, email, name },
      });
    }

    if (type === 'UPDATE') {
      await prisma.user.update({
        where: { id },
        data: { email, name },
      });
    }

    res.status(200).send('ok');
  } catch (err) {
    console.error('[User Webhook Error]', err);
    res.status(500).send('error');
  }
});

// === PhonePe ===
router.post('/phonepe/callback', async (req, res) => {
  console.log('PhonePe callback:', req.body);
  // verify signature and update order status
  res.status(200).send('OK');
});


export { router };
