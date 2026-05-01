import { Plus } from 'lucide-react';

import { Button } from '@prodgenie/libs/ui/button';
import { SectionCard } from '@prodgenie/libs/ui/components/section-card';
import { useModalStore, useWorkspaceStore } from '@prodgenie/libs/store';

import api from '../../utils/api';

const SectionCards = () => {
  const { activeWorkspace, workspaceUsage, totalJobCards } = useWorkspaceStore(
    (state) => state
  );

  const { openModal } = useModalStore();

  const handleChangePlan = () => {
    openModal('workspace:pricing');
  };

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-rows-2 gap-4   *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card ">
      <SectionCard
        title="Total Job Cards"
        value={totalJobCards}
        trend="+18.2%"
        trendDirection="up"
        description="Increase in job volume"
        subtext="Compared to last 30 days"
      />
      {/* <SectionCard
        title="Avg. Generation Time"
        value="2m 45s"
        trend="-8.4%"
        trendDirection="down"
        description="Faster jobcard creation"
        subtext="Enhanced form automation"
      />*/}
      <SectionCard
        title="Available Credits"
        value={`${activeWorkspace?.credits} ₹`}
        button={
          <Button variant="ghost" onClick={handleChangePlan}>
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

export default SectionCards;
