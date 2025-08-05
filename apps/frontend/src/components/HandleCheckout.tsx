import { loadStripe } from '@stripe/stripe-js';

import api from '../utils/api';

import { apiRoutes } from '@prodgenie/libs/constant';
import { useUserStore } from '@prodgenie/libs/store';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const handleCheckout = async () => {
  const { user } = useUserStore.getState();
  const email = user?.email;
  const orgId = user?.org?.id;
  const priceId = 'price_1Rkfw8SBCozNQTHIyI4Yk52I';
  try {
    const res = await api.post(
      `${apiRoutes.payment.base}${apiRoutes.payment.stripeSession}`,
      { priceId, email, orgId }
    );

    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({
      sessionId: res.data.id,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
  }
};

export default handleCheckout;
