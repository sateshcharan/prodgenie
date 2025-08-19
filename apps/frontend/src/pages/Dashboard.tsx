import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import api from '../utils/api';
// import data from './data.json';
import { SectionCards } from '../components/section-cards';

import {
  ChartAreaInteractive,
  HistoryTable,
  DataTable,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@prodgenie/libs/ui';
import { apiRoutes } from '@prodgenie/libs/constant';
import { useUserStore, useWorkspaceStore } from '@prodgenie/libs/store';
import WorkspaceUsers from '../components/WorkspaceUsers';

const Dashboard = () => {
  const user = useUserStore((state) => state.user);
  const { activeWorkspace } = useWorkspaceStore((state) => state);

  const [workspaceHistory, setWorkspaceHistory] = useState([]);

  const workspaceId = activeWorkspace?.id;
  const credits = activeWorkspace?.credits;
  const role = user?.memberships.find((m) => m.workspace.id === workspaceId)?.role;

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const fetchHistoryData = async () => {
          const { data: historyData } = await api.get(
            '/api/workspaces/getWorkspaceHistory'
          );
          setWorkspaceHistory(historyData.data);
        };
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchHistoryData();
  }, []);

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
          <SectionCards credits={credits} />
        </>
      )}

      {/* <div className="px-4 lg:px-6">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <HistoryTable history={workspaceHistory ?? []} />
        )}
      </div> */}

      <Tabs defaultValue="data">
        <TabsList>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <HistoryTable history={workspaceHistory ?? []} />
        </TabsContent>
        <TabsContent value="data">
          <ChartAreaInteractive />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
