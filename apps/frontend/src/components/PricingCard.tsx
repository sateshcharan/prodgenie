import React, { useState } from 'react';
import { PricingCard as PricingCardUI } from '@prodgenie/libs/ui';
import { handleCheckout } from '../components/HandleCheckout';
import api from '../utils/api';

const PricingCard = () => {
  const PRICE_IDS = {
    starter: {
      monthly: 'price_StarterMonthly',
      annual: 'price_StarterAnnual',
    },
    pro: {
      monthly: 'price_ProMonthly',
      annual: 'price_ProAnnual',
    },
    enterprise: {
      monthly: 'price_EnterpriseMonthly',
      annual: 'price_EnterpriseAnnual',
    },
  };

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(
    'monthly'
  );

  const handleCheckout = async (priceId: string) => {
    // const response = await api.post('/api/payment/stripe/session', {
    //   priceId,
    // });

    console.log('Going to checkout with', priceId);
  };

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Choose Your Plan</h2>

        {/* Toggle */}
        <div className="inline-flex rounded-lg bg-white p-1 mb-12">
          {(['monthly', 'annual'] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={`
          px-4 py-2 rounded-lg
          ${
            billingCycle === cycle
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }
        `}
            >
              {cycle === 'monthly' ? 'Monthly' : 'Annual (2 months free)'}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
          {/* Starter */}
          <PricingCardUI
            title="Starter"
            price={billingCycle === 'monthly' ? 29 : 29 * 10} // e.g. 10 months paid instead of 12
            cycle={billingCycle}
            features={[
              'Up to 50 job cards / month',
              'Basic drawing import',
              'Email support',
            ]}
            onClick={() => handleCheckout(PRICE_IDS.starter[billingCycle])}
          />

          {/* Pro */}
          <PricingCardUI
            title="Pro"
            price={billingCycle === 'monthly' ? 99 : 99 * 10}
            cycle={billingCycle}
            features={[
              'Up to 500 job cards / month',
              'BOM extraction',
              'Standard integrations',
              'Priority email support',
            ]}
            onClick={() => handleCheckout(PRICE_IDS.pro[billingCycle])}
          />

          {/* Enterprise */}
          <PricingCardUI
            title="Enterprise"
            price={billingCycle === 'monthly' ? 299 : 299 * 10}
            cycle={billingCycle}
            features={[
              'Unlimited job cards',
              'Custom workflows & API access',
              'Dedicated account manager',
              '24/7 phone support',
            ]}
            onClick={() => handleCheckout(PRICE_IDS.enterprise[billingCycle])}
          />
        </div>
      </div>
    </section>
  );
};

export default PricingCard;
