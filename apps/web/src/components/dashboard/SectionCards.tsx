import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { api } from '../../utils';

import { Button } from '@prodgenie/libs/ui';
import { SectionCard } from '@prodgenie/libs/ui';
import { useModalStore, useWorkspaceStore } from '@prodgenie/libs/store';

const SectionCards = () => {
  const { activeWorkspace } = useWorkspaceStore((state) => state);
  const [jobCardCount, setJobCardCount] = useState('0');

  const { openModal } = useModalStore();

  useEffect(() => {
    const workspaceJobCard = async () => {
      const { data } = await api.get(`/api/files/jobCard/list`);
      data.data && setJobCardCount(data.data.length);
    };

    workspaceJobCard();
  }, [activeWorkspace?.id]);

  const handleChangePlan = () => {
    openModal('workspace:pricing');
  };

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-2 gap-4   *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card ">
      <SectionCard
        title="Total Job Cards"
        value={jobCardCount}
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
      /> */}
      <SectionCard
        title="Available Credits"
        value={`${activeWorkspace?.credits} $`}
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
