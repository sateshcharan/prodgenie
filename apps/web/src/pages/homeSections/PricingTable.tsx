import React, { useState } from 'react';
import { Check, Ban } from 'lucide-react';

const PricingTable = () => {
  const [selectedTier, setSelectedTier] = useState('free');

  const CheckIcon = () => (
    <Check className="w-5 h-5 text-primary inline-block" />
  );
  const BanIcon = () => (
    <Ban className="w-5 h-5 text-muted-foreground inline-block" />
  );

  const TooltipButton = ({ text, tooltip }) => (
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
          values: [
            'Up to 20 pages',
            'Up to 3,000 pages',
            'Up to 1 million pages',
            'Up to 10 million pages',
          ],
          type: 'text',
        },
        {
          name: 'AI parsing engine',
          tooltip: 'Extract data from any document using AI.',
          values: [true, true, true, true],
        },
        {
          name: 'Advanced post processing',
          tooltip:
            'Write Python code to perform advanced manipulations of your parsed data.',
          values: [false, false, true, true],
        },
      ],
    },
    {
      title: 'Integrations',
      items: [
        { name: 'Excel, CSV, and JSON', values: [true, true, true, true] },
        { name: 'Google Sheets', values: [true, true, true, true] },
        { name: 'Zapier', values: [true, true, true, true] },
      ],
    },
  ];

  const tiers = ['free', 'base', 'scale', 'enterprise'];

  const renderTableRow = (feature, rowIndex) => (
    <tr key={rowIndex}>
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
      {feature.values.map((val, i) => (
        <td key={i} className="relative w-1/5 px-4 py-0 text-center">
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
              <CheckIcon />
            ) : (
              <BanIcon />
            )}
          </span>
        </td>
      ))}
    </tr>
  );

  const renderFeatureSection = (section, idx) => (
    <div key={idx} className="relative -mx-8 mt-16">
      <h3 className="text-lg font-semibold mb-4 px-8 text-foreground">
        {section.title}
      </h3>
      <div
        className="absolute inset-x-8 inset-y-0 grid grid-cols-5 gap-x-8 before:block"
        aria-hidden="true"
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-full w-full rounded-lg bg-card shadow-sm"
          ></div>
        ))}
      </div>

      <table className="relative w-full border-separate border-spacing-x-8">
        <tbody>{section.items.map(renderTableRow)}</tbody>
      </table>

      <div
        className="pointer-events-none absolute inset-x-8 inset-y-0 grid grid-cols-5 gap-x-8 before:block"
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

        <div className="sticky top-[75px] z-10 grid grid-cols-5 gap-x-8 border-t border-border bg-muted">
          <div></div>
          {['Free', 'Base', 'Scale', 'Enterprise'].map((tier, i) => {
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
                    ? 'Take Parseur for a spin. See what it can do.'
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

        <div className="relative -mx-8 mt-10">
          <div
            className="absolute inset-x-8 inset-y-0 grid grid-cols-5 gap-x-8"
            aria-hidden="true"
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-full w-full rounded-lg bg-card"></div>
            ))}
          </div>
          <table className="relative w-full border-separate border-spacing-x-8">
            <tbody>
              <tr>
                <th scope="row">
                  <span className="sr-only">CTA section</span>
                </th>
                {['free', 'base', 'scale'].map((tier) => (
                  <td
                    key={tier}
                    className="relative w-1/5 px-4 py-0 text-center"
                  >
                    <a
                      href="https://app.parseur.com/signup"
                      className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center rounded-xl px-4 py-2 text-base font-medium text-primary-foreground shadow-md transition-colors"
                    >
                      Start free trial
                    </a>
                  </td>
                ))}
                <td className="relative w-1/5 px-4 py-0 text-center">
                  <a
                    href="/quote"
                    className="bg-secondary hover:bg-secondary/90 flex w-full items-center justify-center rounded-xl px-4 py-2 text-base font-medium text-secondary-foreground shadow-md transition-colors"
                  >
                    Request a quote
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default PricingTable;
