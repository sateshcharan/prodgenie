import React, { useState } from 'react';
import { Check, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@prodgenie/libs/store/lib/user';

import { useModalStore } from '@prodgenie/libs/store';
import { Button } from '@prodgenie/libs/ui/button';

const PricingTable = () => {
  const [selectedTier, setSelectedTier] = useState('pro');
  const { openModal } = useModalStore();
  const navigate = useNavigate();

  const handleSignupClick = () => {
    openModal('auth:signup');
  };

  const TooltipButton = ({ text, tooltip }: any) => (
    <button
      type="button"
      className="inline-block text-left hover:cursor-help group relative"
      title={tooltip}
    >
      <span className="border-b-2 border-dashed border-muted-foreground">
        {text}
      </span>
    </button>
  );

  const featureSections = [
    {
      title: 'Features',
      items: [
        {
          name: 'Pages processed / month',
          values: ['Up to 5 pages', 'Up to 100 pages', '> to 100 pages'],
          type: 'text',
        },
        {
          name: 'AI parsing engine',
          tooltip: 'Extract data from any document using AI.',
          values: [false, true, true],
        },
        {
          name: 'Advanced post processing',
          tooltip:
            'Write Python code to perform advanced manipulations of your parsed data.',
          values: [false, false, true],
        },
      ],
    },
    {
      title: 'Integrations',
      items: [
        { name: 'Excel, CSV, and JSON', values: [true, true, true] },
        { name: 'Google Sheets', values: [false, false, true] },
        // { name: 'Zapier', values: [true, true, true] },
      ],
    },
  ];

  const tiers = ['Starter', 'Pro', 'Enterprise'];

  const renderTableRow = (feature: any, rowIndex: number) => (
    <tr key={feature.name}>
      <th
        scope="row"
        className="w-1/5 py-3 pr-4 text-left text-sm font-normal leading-6 text-foreground"
      >
        {feature.tooltip ? (
          <TooltipButton text={feature.name} tooltip={feature.tooltip} />
        ) : (
          feature.name
        )}
        <div className="absolute inset-x-8 mt-3 h-px bg-border"></div>
      </th>
      {feature.values.map((val: any, i: number) => (
        <td
          key={`${feature.name}-${tiers[i]}`}
          className="relative w-1/5 px-4 py-0 text-center"
        >
          <span className="relative h-full w-full py-3">
            {feature.type === 'text' ? (
              <span
                className={`text-sm leading-6 ${
                  selectedTier === tiers[i]
                    ? 'font-semibold text-primary'
                    : 'text-foreground'
                }`}
              >
                {val}
              </span>
            ) : val ? (
              <Check className="w-5 h-5 text-primary inline-block" />
            ) : (
              <Ban className="w-5 h-5 text-muted-foreground inline-block" />
            )}
          </span>
        </td>
      ))}
    </tr>
  );

  const renderFeatureSection = (section: any, idx: number) => (
    <div key={section.title} className="relative -mx-8 mt-16">
      <h3 className="text-lg font-semibold mb-4 px-8 text-foreground">
        {section.title}
      </h3>
      <div
        className={`absolute inset-x-8 inset-y-0 grid 
          grid-cols-${tiers.length + 1} gap-x-8 before:block`}
        aria-hidden="true"
      >
        {[...Array(tiers.length)].map((_, i) => (
          <div
            key={`cta-${i}`}
            className="h-full w-full rounded-lg bg-card shadow-sm"
          ></div>
        ))}
      </div>

      <table className="relative w-full border-separate border-spacing-x-8">
        <tbody>{section.items.map(renderTableRow)}</tbody>
      </table>

      <div
        className={`pointer-events-none absolute inset-x-8 inset-y-0 grid grid-cols-${
          tiers.length + 1
        } gap-x-8 before:block`}
        aria-hidden="true"
      >
        {tiers.map((tier) => (
          <div
            key={tier}
            className={`rounded ${
              selectedTier === tier
                ? 'ring-2 ring-primary'
                : 'ring-1 ring-border'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <section aria-labelledby="comparison-heading" className="hidden lg:block">
        <h2 id="comparison-heading" className="sr-only sticky top-[75px]">
          Feature comparison
        </h2>

        <div
          className={`sticky top-[75px] z-10 grid grid-cols-4 gap-x-8 border-t border-border bg-muted`}
        >
          <div></div>
          {tiers.map((tier, i) => {
            const id = tier.toLowerCase();
            return (
              <div
                key={id}
                className={`py-10 cursor-pointer ${
                  selectedTier === id
                    ? 'border-t-2 border-primary'
                    : 'border-t-2 border-transparent'
                }`}
                onClick={() => setSelectedTier(id)}
              >
                <p
                  className={`text-sm font-semibold leading-6 ${
                    selectedTier === id ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {tier} tier
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {i === 0
                    ? 'Take Prodgenie for a spin. See what it can do.'
                    : i === 1
                    ? 'Start automating your extractions.'
                    : i === 2
                    ? 'Heavy-duty plans. Lowest cost per page.'
                    : 'Custom plans for large organizations.'}
                </p>
              </div>
            );
          })}
        </div>

        {featureSections.map(renderFeatureSection)}

        {/* CTA Section */}
        <div className="mt-10 px-8">
          <div className={`grid grid-cols-${tiers.length + 1} gap-8`}>
            {/* Empty first column */}
            <div />

            {[...Array(tiers.length - 1)].map((_, i) => (
              <Button key={i} onClick={handleSignupClick}>
                Start free trial
              </Button>
            ))}

            <Button variant="secondary" onClick={() => navigate('/contact')}>
              Request a quote
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingTable;
