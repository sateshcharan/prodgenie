import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  ChartAreaInteractive,
  HistoryTable,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@prodgenie/libs/ui';
import { apiRoutes } from '@prodgenie/libs/constant';
import { useUserStore, useWorkspaceStore } from '@prodgenie/libs/store';

import api from '../utils/api';
import { SectionCards, TransactionTable, WorkspaceUsers } from '../components';

const Dashboard = () => {
  const user = useUserStore((state) => state.user);
  const { activeWorkspace } = useWorkspaceStore((state) => state);

  const [workspaceActivity, setWorkspaceActivity] = useState([]);
  const [workspaceTransactions, setWorkspaceTransactions] = useState([]);

  const workspaceId = activeWorkspace?.id;
  const credits = activeWorkspace?.credits;
  const role = user?.memberships.find(
    (m) => m.workspace.id === workspaceId
  )?.role;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: activityData } = await api.get(
          `${apiRoutes.workspace.base}${apiRoutes.workspace.getWorkspaceActivity}`
        );
        const { data: transactionData } = await api.get(
          `${apiRoutes.workspace.base}${apiRoutes.workspace.getWorkspaceTransactions}`
        );

        setWorkspaceActivity(activityData.data);
        setWorkspaceTransactions(transactionData.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchData();
  }, [workspaceId]);

  // polling with react-query
  // const {
  //   data: workspaceHistory,
  //   refetch,
  //   isLoading,
  // } = useQuery({
  //   queryKey: ['workspaceHistory'],
  //   queryFn: async () => {
  //     const { data } = await api.get('/api/workspaces/getWorkspaceHistory');
  //     return data.data;
  //   },
  //   enabled: !!workspaceId, // only start when workspaceId is loaded
  //   refetchInterval: 30000, // polling every 5s
  //   refetchIntervalInBackground: false, // don't poll when tab is hidden
  // });

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
      {(role === 'OWNER' || role === 'ADMIN') && (
        <>
          <WorkspaceUsers />
          <SectionCards />
        </>
      )}

      <Tabs defaultValue="trend">
        <TabsList>
          <TabsTrigger value="trend">Trend</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="transaction">Transaction</TabsTrigger>
        </TabsList>
        <TabsContent value="trend">
          <ChartAreaInteractive />
        </TabsContent>
        <TabsContent value="activity">
          <HistoryTable history={workspaceActivity ?? []} />
        </TabsContent>
        <TabsContent value="transaction">
          <TransactionTable transactions={workspaceTransactions ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
