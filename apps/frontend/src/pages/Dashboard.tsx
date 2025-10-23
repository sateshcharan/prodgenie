import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRoutes } from '@prodgenie/libs/constant';
import { ChartAreaInteractive } from '@prodgenie/libs/ui';
import { useUserStore, useWorkspaceStore } from '@prodgenie/libs/store';

import api from '../utils/api';
import { useSSE } from '../hooks/useSSE';
import { SectionCards, WorkspaceUsers, EventTable } from '../components';

const Dashboard = () => {
  const user = useUserStore((state) => state.user);
  const { activeWorkspace } = useWorkspaceStore((state) => state);
  const workspaceId = activeWorkspace?.id;
  const queryClient = useQueryClient();

  const role = user?.memberships.find(
    (m) => m.workspace.id === workspaceId
  )?.role;

  // const [workspaceEvents, setWorkspaceEvents] = useState([]);

  // const credits = activeWorkspace?.credits;

  // polling evetns via react-query
  const {
    data: workspaceEvents = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['workspaceEvents', workspaceId],
    queryFn: async () => {
      const { data } = await api.get(
        `${apiRoutes.workspace.base}${apiRoutes.workspace.getWorkspaceEvents}`
      );
      return data.data;
    },
    enabled: !!workspaceId, // only start when workspaceId is loaded
    // refetchInterval: 30000, // polling every 5s
    // refetchIntervalInBackground: false, // don't poll when tab is hidden
  });

  // 🔹 Handle SSE messages and update cache
  const onMessage = useCallback(
    (msg) => {
      queryClient.setQueryData(['workspaceEvents', workspaceId], (old = []) => {
        let updated = old;

        if (msg.type === 'created') {
          updated = [msg.payload, ...old];
        } else if (msg.type === 'update' || msg.type === 'progress') {
          updated = old.map((e) =>
            e.id === msg.payload.id
              ? { ...e, ...msg.payload } // ✅ ensure new object reference
              : e
          );
        }

        // ✅ always return a fresh array reference
        return [...updated];
      });
    },
    [queryClient, workspaceId]
  );

  useSSE(workspaceId, onMessage);

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
      {(role === 'OWNER' || role === 'ADMIN') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4 ">
            <WorkspaceUsers />
            <SectionCards />
          </div>
          <ChartAreaInteractive />
        </div>
      )}

      <EventTable key={workspaceId} events={workspaceEvents ?? []} />
    </div>
  );
};

export default Dashboard;
