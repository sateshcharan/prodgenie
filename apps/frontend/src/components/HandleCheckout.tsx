import { loadStripe } from '@stripe/stripe-js';

import { apiRoutes } from '@prodgenie/libs/constant';
import { useUserStore } from '@prodgenie/libs/store';

import api from '../utils/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const handleCheckout = async (gateway: 'stripe' | 'phonepe' = 'phonepe') => {
  const { user } = useUserStore.getState();
  const email = user?.email;
  const workspaceId = user?.workspace?.id;

  try {
    if (gateway === 'stripe') {
      // Stripe Checkout
      const priceId = 'price_1Rkfw8SBCozNQTHIyI4Yk52I';
      const res = await api.post(
        `${apiRoutes.payment.base}${apiRoutes.payment.stripeSession}`,
        { priceId, email, workspaceId }
      );

      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({
        sessionId: res.data.id,
      });

      return;
    }

    if (gateway === 'phonepe') {
      // PhonePe
      const orderId = `ORD-${Date.now()}`;
      const amount = 1;
      const mobile = '9999999999';
      const name = user?.name || 'Guest User';

      const res = await api.post(`${apiRoutes.payment.base}/phonepe/payment`, {
        orderId,
        amount,
        mobile,
        name,
      });

      // PhonePe returns a redirect URL
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
