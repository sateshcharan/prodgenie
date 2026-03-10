import { useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Outlet, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import {
  useUserStore,
  useWorkspaceStore,
  // useNotificationStore,
} from '@prodgenie/libs/store';
import { apiRoutes } from '@prodgenie/libs/constant';
import { SiteHeader } from '@prodgenie/libs/ui/components/site-header';
import { SidebarInset, SidebarProvider } from '@prodgenie/libs/ui/sidebar';

import api from '../utils/api';
// import { useSSE } from '../hooks/useSSE';
import PrivateHeader from '../navigation/PrivateHeader';
import ChatWidget from '../components/ChatWidget';
import AppSidebar from '../components/AppSidebar';
import ModalManager from '../components/modal/ModalManager';
// import { subscribeToEvents } from '../components/SubscribeToEvents';

const PrivateLayout = () => {
  const {
    activeWorkspace,
    setWorkspaces,
    setActiveWorkspace,
    setActiveWorkspaceRole,
    setWorkspaceUsers,
    setWorkspaceEvents,
    subscribeToEvents,
    setWorkspaceUsage,
    setJobCardStats,
    setTotalJobCards,
  } = useWorkspaceStore((state) => state);
  const setUser = useUserStore((state) => state.setUser);
  // const setNotifications = useNotificationStore(
  //   (state) => state.setNotifications
  // );

  const { fileType } = useParams();

  // const queryClient = useQueryClient();
  // const workspaceId = activeWorkspace?.id;

  // // 🔹 Handle SSE messages and update cache
  // const onMessage = useCallback(
  //   (msg) => {
  //     console.log('[SSE] Message received:', msg); // ✅ log the payload

  //     queryClient.setQueryData(['workspaceEvents', workspaceId], (old = []) => {
  //       let updated = old;

  //       if (msg.type === 'event_created') {
  //         updated = [msg.payload, ...old];
  //       } else if (
  //         msg.type === 'event_update' ||
  //         msg.type === 'event_progress'
  //       ) {
  //         updated = old.map((e) =>
  //           e.id === msg.payload.Id ? { ...e, ...msg.payload } : e
  //         );
  //       }

  //       return [...updated];
  //     });
  //   },
  //   [queryClient, workspaceId]
  // );

  // useSSE(workspaceId, onMessage);

  // determine title for SiteHeader

  const getPageTitle = () => {
    if (fileType) return fileType;
    if (location.pathname.includes('settings')) return 'Settings';
    return 'Dashboard';
  };

  // const activeWorkspaceId = useWorkspaceStore(
  //   (state) => state.activeWorkspace?.id
  // );

  //batched init
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-init'], // need to update with workspaceId
    queryFn: () =>
      api
        .get(`${apiRoutes.batched.base}${apiRoutes.batched.init}`)
        .then((r) => r.data),
    enabled: true,
    staleTime: Infinity,
    // refetchOnMount: false,
    // refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      const totalJobCards = data.user.memberships.find(
        (m: any) => m.workspaceId === data.user.activeWorkspaceId
      ).workspace.jobCardsCount;

      setUser(data.user);
      setWorkspaceEvents(data.workspaceEvents);
      setJobCardStats(data.jobCardStats);
      setWorkspaceUsage(data.workspaceUsage);
      setTotalJobCards(totalJobCards);
      // setNotifications(data.notifications);
      // setWorkspaceUsers(data.workspaceUsers);

      const workspaces = data.user.memberships.map((m) => m.workspace);
      // all memberships
      setWorkspaces(workspaces);

      // find and set active workspace
      const activeMembership = data.user.memberships.find(
        (m: any) => m.workspaceId === data.user.activeWorkspaceId
      );
      setActiveWorkspace(activeMembership?.workspace || null);
      setActiveWorkspaceRole(activeMembership?.role || null);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      subscribeToEvents(data.user.activeWorkspaceId);
    }

    return () => {
      // cleanup on unmount or workspace change
      useWorkspaceStore.getState().reset();
    };
  }, [data]);

  // useEffect(() => {
  //   if (activeWorkspace?.id) {
  //     subscribeToEvents(activeWorkspace.id);
  //   }
  // }, [activeWorkspace?.id]);

  return (
    <>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset className="flex flex-col h-screen">
          <div className="shrink-0 sticky top-0 z-10 bg-background">
            <PrivateHeader />
            <SiteHeader title={getPageTitle()} />
          </div>
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>

      <ChatWidget />

      {/* all private modals render here */}
      <ModalManager />
    </>
  );
};

export default PrivateLayout;
