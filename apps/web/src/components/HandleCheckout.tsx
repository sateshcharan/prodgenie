import { loadStripe } from '@stripe/stripe-js';

import { apiRoutes } from '@prodgenie/libs/constant';
import { useUserStore } from '@prodgenie/libs/store';

import api from '../utils/api';

const stripePromise = loadStripe(import.meta.env.STRIPE_PUBLISHABLE_KEY);

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
  const email = user?.email;
  const workspaceId = user?.workspace?.id;

  try {
    // Stripe checkout
    if (gateway === 'stripe') {
      const res = await api.post(
        `${apiRoutes.payment.base}${apiRoutes.payment.stripeSession}`,
        {
          planId,
          billingCycle,
          email,
          workspaceId,
          type,
          priceId: 'price_1Rkfw8SBCozNQTHIyI4Yk52I',
        }
      );

      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId: res.data.id });
      return;
    }

    // PhonePe checkout
    if (gateway === 'phonepe') {
      const orderId = `ORD-${Date.now()}`;
      const mobile = '9999999999';
      const name = user?.name || 'Guest User';

      const res = await api.post(`${apiRoutes.payment.base}/phonepe/payment`, {
        orderId,
        planId,
        billingCycle,
        type,
        amount,
        mobile,
        name,
        workspaceId,
        email,
      });

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
