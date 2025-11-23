import { loadStripe } from '@stripe/stripe-js';

import { apiRoutes } from '@prodgenie/libs/constant';
import { useUserStore, useWorkspaceStore } from '@prodgenie/libs/store';

import api from '../utils/api';

type CheckoutOptions = {
  gateway?: 'stripe' | 'phonepe';
  planId?: string;
  billingCycle?: 'monthly' | 'annual';
  type?: 'subscription' | 'credits';
  amount?: number;
};

const handleCheckout = async ({
  gateway = 'phonepe',
  planId,
  billingCycle = 'monthly',
  type = 'subscription',
  amount,
}: CheckoutOptions) => {
  const { user } = useUserStore.getState();
  const { activeWorkspace } = useWorkspaceStore.getState();

  const email = user?.email;
  const workspaceId = activeWorkspace?.id;

  try {
    // Stripe checkout
    if (gateway === 'stripe') {
      if (!planId) throw new Error('planId required for Stripe checkout');

      const res = await api.post(
        `${apiRoutes.payment.base}${apiRoutes.payment.stripeSession}`,
        {
          planId,
          billingCycle,
          email,
          workspaceId,
          type,
          priceId: import.meta.env.VITE_STRIPE_PRICE_ID!,
        }
      );

      const stripe = await loadStripe(
        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      );

      await stripe?.redirectToCheckout({ sessionId: res.data.id });
      return;
    }

    // PhonePe checkout
    if (gateway === 'phonepe') {
      if (type === 'credits' && !amount)
        throw new Error('amount required for credits purchase');

      const orderId = `ORD-${Date.now()}`;
      const mobile = '9999999999';
      const name = user?.name || 'Guest User';

      const res = await api.post(
        `${apiRoutes.payment.base}${apiRoutes.payment.phonepeCreatePayment}`,
        {
          orderId,
          planId,
          billingCycle,
          type,
          amount,
          mobile,
          name,
          workspaceId,
          email,
        }
      );

      const redirectUrl =
        res.data?.redirectUrl ||
        res.data?.data?.instrumentResponse?.redirectInfo?.url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        console.error('PhonePe redirect URL not found:', res.data);
      }
      return;
    }
  } catch (error) {
    console.error(`${gateway} checkout error:`, error);
  }
};

export default handleCheckout;
