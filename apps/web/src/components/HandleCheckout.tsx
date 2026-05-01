import { loadStripe } from '@stripe/stripe-js';

import { apiRoutes } from '@prodgenie/libs/constant';
import {
  useUserStore,
  useWorkspaceStore,
  useModalStore,
} from '@prodgenie/libs/store';

import api from '../utils/api';

type CheckoutOptions = {
  gateway?: 'stripe' | 'phonepe' | 'manual_qr';
  planId?: string;
  billingCycle?: 'monthly' | 'annual';
  type?: 'subscription' | 'credits';
  amount?: number;
  navigate?: (path: string) => void;
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
  const priceId = import.meta.env.VITE_STRIPE_PRICE_ID!;

  const { closeModal } = useModalStore.getState();

  // console.log(priceId);

  try {
    closeModal();

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
          priceId,
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

      const merchantOrderId = `ORD-${Date.now()}`;
      const mobile = '9999999999';
      const name = user?.name || 'Guest User';

      const res = await api.post(
        `${apiRoutes.payment.base}${apiRoutes.payment.phonepeCreate}`,
        {
          merchantOrderId,
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

      const redirectUrl = res.data.phonepe.redirectUrl;

      console.log(redirectUrl);

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        console.error('PhonePe redirect URL not found:', res.data);
      }
      return;
    }

    // manual qr code
    // if (gateway === 'manual_qr') {}
  } catch (error) {
    console.error(`${gateway} checkout error:`, error);
  }
};

export default handleCheckout;
