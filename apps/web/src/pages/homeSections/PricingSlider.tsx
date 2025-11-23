import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@prodgenie/libs/ui/button';
import { apiRoutes } from '@prodgenie/libs/constant';

import api from '../../utils/api';

const PricingSlider = () => {
  const [plans, setPlans] = useState<
    { id: string; title: string; price: number; features: string[] }[]
  >([]);
  const [interval, setInterval] = useState<'month' | 'year'>('year');
  const [pages, setPages] = useState(20);
  const isYearly = interval === 'year';

  const YEARLY_DISCOUNT = 0.25; // 25% off = 3 months free

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
            title: p.title || p.name,
            price: p.price,
            features: parsedFeatures,
          };
        });

        setPlans(formattedPlans);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlans();
  }, []);

  const getPlanByPages = (pageCount: number) => {
    if (!plans.length) return null;
    if (pageCount <= 50) return plans.find((p) => p.id === 'free');
    if (pageCount <= 500) return plans.find((p) => p.id === 'starter');
    return plans.find((p) => p.id === 'enterprise');
  };

  const selectedPlan = getPlanByPages(pages);

  return (
    <form className="mt-28 flex flex-col items-center text-center">
      {/* Promo Label */}
      <div className="absolute -mt-[90px] ml-[170px] w-48 text-center text-lg font-semibold tracking-tighter text-primary sm:ml-[100px] sm:text-xl">
        <span className="absolute -ml-[200px] -mt-[16px] w-32 sm:ml-[60px]">
          Get 3 months for free!
        </span>
        <svg
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 415.262 415.261"
          aria-hidden="true"
          className="absolute h-24 w-20 origin-bottom-right -rotate-90 -scale-x-100 sm:rotate-90 sm:scale-100"
        >
          <g>
            <path d="M414.937,374.984c-7.956-24.479-20.196-47.736-30.601-70.992c-1.224-3.06-6.12-3.06-7.956-1.224 c-10.403,11.016-22.031,22.032-28.764,35.496h-0.612c-74.664,5.508-146.88-58.141-198.288-104.652 c-59.364-53.244-113.22-118.116-134.64-195.84c-1.224-9.792-2.448-20.196-2.448-30.6c0-4.896-6.732-4.896-7.344,0 c0,1.836,0,3.672,0,5.508C1.836,12.68,0,14.516,0,17.576c0.612,6.732,2.448,13.464,3.672,20.196 C8.568,203.624,173.808,363.356,335.376,373.76c-5.508,9.792-10.403,20.195-16.523,29.988c-3.061,4.283,1.836,8.567,6.12,7.955 c30.6-4.283,58.14-18.972,86.292-29.987C413.712,381.104,416.16,378.656,414.937,374.984z" />
          </g>
        </svg>
      </div>

      {/* Toggle */}
      <fieldset aria-label="Plan interval">
        <div className="grid grid-cols-2 gap-1 rounded-full ring-1 ring-inset ring-border p-1 font-semibold">
          <button
            type="button"
            onClick={() => setInterval('month')}
            className={`px-4 py-1 rounded-full transition ${
              !isYearly
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setInterval('year')}
            className={`px-4 py-1 rounded-full transition ${
              isYearly
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Annually
          </button>
        </div>
      </fieldset>

      {/* Slider */}
      <p className="mt-8 text-xl text-muted-foreground lg:text-2xl">
        How many job cards do you process per month? Move the slider.
      </p>
      <div className="relative w-full max-w-md my-10">
        <input
          id="plan-slider"
          type="range"
          min="0"
          max="1200"
          step="300"
          value={pages}
          onChange={(e) => setPages(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="absolute left-1/2 -translate-x-1/2 top-6 bg-muted px-3 py-1 rounded-lg text-foreground text-lg font-semibold">
          {pages.toLocaleString()} job cards / {isYearly ? 'year' : 'month'}
        </div>
      </div>

      {/* Plan Card */}
      {selectedPlan && (
        <div className="flex flex-col md:flex-row justify-center items-center gap-0 mt-10">
          <div className="relative flex flex-col justify-center items-center border-2 border-border rounded-2xl shadow-sm p-8 w-full md:w-[375px] bg-background h-[400px]">
            <h2 className="absolute -top-4 bg-background px-4 font-extrabold text-foreground capitalize">
              {selectedPlan.title} Plan
            </h2>

            <div className="mt-6">
              {isYearly ? (
                <>
                  {/* Original Yearly Price (slashed) */}
                  <div className="text-3xl font-semibold text-muted-foreground line-through">
                    ₹{(selectedPlan?.price * 12).toLocaleString('en-IN')}
                  </div>

                  {/* Discounted Price */}
                  <div className="text-8xl font-bold text-foreground -mt-2">
                    ₹
                    {Math.round(
                      selectedPlan?.price * 12 * (1 - YEARLY_DISCOUNT)
                    ).toLocaleString('en-IN')}
                  </div>

                  <p className="text-green-600 font-semibold mt-2">
                    Save {YEARLY_DISCOUNT * 100}% — 3 months free
                  </p>
                </>
              ) : (
                <>
                  {/* Monthly Price */}
                  <div className="text-8xl font-bold text-foreground">
                    ₹{selectedPlan.price.toLocaleString('en-IN')}
                  </div>
                </>
              )}

              <p className="text-muted-foreground mt-2">
                per {isYearly ? 'year' : 'month'}
              </p>
            </div>

            <Button className="mt-4 bg-primary text-primary-foreground px-6  rounded-full hover:scale-105 transition">
              Get started
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              All prices exclude VAT/GST, where applicable.
            </p>
          </div>

          {/* What's Included */}
          <div className="bg-primary text-primary-foreground rounded-r-2xl p-8 shadow-md w-full md:w-[450px] h-[300px]">
            <h3 className="text-3xl font-semibold mb-6">What's included?</h3>
            <ul className="space-y-3 text-left">
              {selectedPlan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="h-5 w-5 mt-1 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </form>
  );
};

export default PricingSlider;
