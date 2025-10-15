import React, { useEffect, useState } from 'react';

import { cn } from '@prodgenie/libs/utils';
import { useAuthStore } from '@prodgenie/libs/store';
import { apiRoutes } from '@prodgenie/libs/constant';
import { Button, PricingCard as PricingCardUI } from '@prodgenie/libs/ui';

import { api } from '../utils';
import handleCheckout from './HandleCheckout';

const PricingCard = ({ variant = 'page' }: { variant?: 'page' | 'modal' }) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(
    'monthly'
  );

  const { setAuthType } = useAuthStore();
  const handleClick = () => setAuthType('signup');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const {
          data: { data: dbplans },
        } = await api.get(
          `${apiRoutes.projectWide.base}${apiRoutes.projectWide.getPlans}`
        );

        const formattedPlans = dbplans.map((p: any) => {
          let parsedFeatures: string[] = [];

          try {
            const raw =
              typeof p.features === 'string'
                ? JSON.parse(p.features)
                : p.features;
            parsedFeatures = raw?.features ?? [];
          } catch (err) {
            console.error('Error parsing features:', err);
          }

          return {
            id: p.id,
            title: p.name,
            price: p.price,
            features: parsedFeatures,
          };
        });

        console.log(formattedPlans);
        setPlans(formattedPlans);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlans();
  }, []);

  const computePrice = (base: number) =>
    billingCycle === 'monthly' ? base : base * 10;

  return (
    <section
      className={cn(
        'bg-muted/50',
        variant === 'page' && 'py-20',
        variant === 'modal' && 'p-4 max-h-[70vh] overflow-y-auto rounded-lg'
      )}
    >
      <div
        className={cn(
          'mx-auto text-center',
          variant === 'page' ? 'container px-4' : ''
        )}
      >
        <h2
          className={cn(
            'font-bold mb-6',
            variant === 'page' ? 'text-3xl' : 'text-xl'
          )}
        >
          Choose Your Plan
        </h2>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex rounded-lg bg-white p-1 mb-8">
          {(['monthly', 'annual'] as const).map((cycle) => (
            <Button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              variant={billingCycle === cycle ? 'default' : 'ghost'}
            >
              {cycle === 'monthly' ? 'Monthly' : 'Annual (2 months free)'}
            </Button>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6">
          {plans.map((plan) => (
            <PricingCardUI
              key={plan.id}
              title={plan.title}
              price={computePrice(plan.price)}
              cycle={billingCycle}
              features={plan.features}
              onClick={plan.price === 0 ? handleClick : handleCheckout}
            />
          ))}
        </div>

        {/* ➕ Credit Top-Up Option */}
        <div className="bg-white rounded-lg shadow p-6 w-full mx-auto my-4">
          <h3
            className={cn(
              'font-bold mb-2',
              variant === 'page' ? 'text-3xl' : 'text-xl'
            )}
          >
            Need more credits?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Purchase extra credits anytime within your billing cycle.
          </p>
          <div className="flex justify-center gap-4">
            {[50, 500, 1000].map((credits) => (
              <Button
                key={credits}
                onClick={() =>
                  handleCheckout({ type: 'credits', amount: credits })
                }
              >
                {credits} credits
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingCard;
