import Stripe from 'stripe';

import { prisma } from '@prodgenie/libs/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

export const StripeService = {
  async createCheckoutSession(email: string, orgId: string, priceId: string) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      billing_address_collection: 'required',
      mode: 'subscription',
      success_url: `${process.env.PAYMENT_SUCCESS_URL}`,
      cancel_url: `${process.env.PAYMENT_CANCEL_URL}`,
      metadata: {
        orgId,
      },
    });
    return { id: session.id };
  },

  async processEvent(req: any) {
    const sig = req.headers['stripe-signature'] as string;
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.orgId;

      if (orgId) {
        await prisma.org.update({
          where: { id: orgId },
          data: { credits: { increment: 1000 } },
        });
      }
    }
  },
};
