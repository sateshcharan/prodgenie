import { useCallback, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { apiRoutes } from '@prodgenie/libs/constant';
import {
  useUserStore,
  useWorkspaceStore,
  useNotificationStore,
} from '@prodgenie/libs/store';
import { SidebarInset, SidebarProvider, SiteHeader } from '@prodgenie/libs/ui';

import { api } from '../utils';
import { useSSE } from '../hooks/useSSE';
import { PrivateHeader } from '../navigation';
import ChatWidget from '../components/ChatWidget';
import { AppSidebar, ModalManager } from '../components';

const PrivateLayout = () => {
  const setUser = useUserStore((state) => state.setUser);
  const {
    setWorkspaces,
    setActiveWorkspace,
    setActiveWorkspaceRole,
    setWorkspaceUsers,
    activeWorkspace,
  } = useWorkspaceStore((state) => state);

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

  useEffect(() => {
    // fetch current user
    const fetchUserData = async () => {
      const { data } = await api.get(
        `${apiRoutes.users.base}${apiRoutes.users.getProfile}`
      );
      setUser(data);
      const workspaces = data.memberships.map((m) => m.workspace);
      setWorkspaces(workspaces);
      setActiveWorkspace(workspaces[0]);
      setActiveWorkspaceRole(
        data.memberships.find((m) => m.workspace.id === workspaces[0].id)?.role
      );
    };
    fetchUserData();
  }, [setUser, setWorkspaces, setActiveWorkspace]);

  // fetch workspace users
  useEffect(() => {
    if (!activeWorkspace) return;
    const fetchWorkspaceUsers = async () => {
      const { data: workspaceUsers } = await api.get(
        `${apiRoutes.workspace.base}${apiRoutes.workspace.getWorkspaceUsers}`,
        { params: { workspaceId: activeWorkspace.id } }
      );
      setWorkspaceUsers(workspaceUsers.data);
    };
    fetchWorkspaceUsers();
  }, [activeWorkspace, setWorkspaceUsers]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await api.get(
        `${apiRoutes.notification.base}${apiRoutes.notification.getUserNotifications}`
      );
      useNotificationStore.getState().setNotifications(data.data);
    };
    fetchNotifications();
  }, []);

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

      {/* chat widget */}
      <ChatWidget />

      {/* all private modals render here */}
      <ModalManager />
    </>
  );
};

export default PrivateLayout;
