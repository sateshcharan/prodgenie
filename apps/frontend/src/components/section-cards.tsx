import { Plus } from 'lucide-react';
import { Button } from '@prodgenie/libs/ui';
import { SectionCard } from '@prodgenie/libs/ui';

import handleCheckout from '../components/HandleCheckout';

const SectionCards = (credits: number) => {
  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-3 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <SectionCard
        title="Total Job Cards Generated"
        value="320"
        trend="+18.2%"
        trendDirection="up"
        description="Increase in job volume"
        subtext="Compared to last 30 days"
      />
      <SectionCard
        title="Avg. Generation Time"
        value="2m 45s"
        trend="-8.4%"
        trendDirection="down"
        description="Faster jobcard creation"
        subtext="Enhanced form automation"
      />
      <SectionCard
        title="Available Credits"
        value={`${credits?.credits} $`}
        // value={`1000`} 
        button={
          <Button variant="ghost" onClick={handleCheckout}>
            <Plus className="size-4" /> Add More
          </Button>
        }
        trend="+6.3%"
        trendDirection="up"
        description="Completion rate improving"
        subtext="Better production efficiency"
      />
    </div>
  );
};

export { SectionCards };
