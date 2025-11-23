import Stripe from 'stripe';

import { prisma } from '@prodgenie/libs/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

export const StripeService = {
  async createCheckoutSession(
    email: string,
    workspaceId: string,
    planId: string
  ) {
    const priceId = process.env.STRIPE_PRICE_ID; // fix this referece update price id's against planId in db

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      billing_address_collection: 'required',
      mode: 'subscription',
      success_url: `${process.env.STRIPE_SUCCESS_URL}`,
      cancel_url: `${process.env.STRIPE_CANCEL_URL}`,
      metadata: {
        workspaceId,
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
      const workspaceId = session.metadata?.workspaceId;

      if (workspaceId) {
        await prisma.workspace.update({
          where: { id: workspaceId },
          data: { credits: { increment: 1000 } },
        });
      }
    }
  },
};
