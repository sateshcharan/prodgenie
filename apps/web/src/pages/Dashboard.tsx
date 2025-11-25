import { useUserStore, useWorkspaceStore } from '@prodgenie/libs/store';
import ChartAreaInteractive from '@prodgenie/libs/ui/components/chart-area-interactive';

import EventTable from '../components/dashboard/EventTable';
import SectionCards from '../components/dashboard/SectionCards';
import WorkspaceUsers from '../components/dashboard/WorkspaceUsers';

const Dashboard = () => {
  const user = useUserStore((state) => state.user);
  const { activeWorkspace } = useWorkspaceStore((state) => state);
  const workspaceId = activeWorkspace?.id;

  const role = user?.memberships.find(
    (m) => m.workspace.id === workspaceId
  )?.role;

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
      {(role === 'owner' || role === 'admin') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4 ">
            <WorkspaceUsers />
            <SectionCards />
          </div>
          <ChartAreaInteractive />
        </div>
      )}

      <EventTable />
    </div>
  );
};

export default Dashboard;
