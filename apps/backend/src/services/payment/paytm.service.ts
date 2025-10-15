import Stripe from 'stripe';

import { prisma } from '@prodgenie/libs/prisma';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

export const PaytmService = {
  //   async createCheckoutSession(email: string, orgId: string, priceId: string) {
  //     const session = await stripe.checkout.sessions.create({
  //       payment_method_types: ['card'],
  //       customer_email: email,
  //       line_items: [{ price: priceId, quantity: 1 }],
  //       billing_address_collection: 'required',
  //       mode: 'subscription',
  //       success_url: `${process.env.PAYMENT_SUCCESS_URL}`,
  //       cancel_url: `${process.env.PAYMENT_CANCEL_URL}`,
  //       metadata: {
  //         orgId,
  //       },
  //     });
  //     return { id: session.id };
  //   },
};
