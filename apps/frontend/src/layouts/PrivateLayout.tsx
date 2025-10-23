import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import { apiRoutes } from '@prodgenie/libs/constant';
import { useUserStore, useWorkspaceStore } from '@prodgenie/libs/store';
import { SidebarInset, SidebarProvider, SiteHeader } from '@prodgenie/libs/ui';

import { api } from '../utils';
import { PrivateHeader } from '../navigation';
import ChatWidget from '../components/ChatWidget';
import { AppSidebar, ModalManager } from '../components';

const PrivateLayout = () => {
  const setUser = useUserStore((state) => state.setUser);
  const {
    setWorkspaces,
    setActiveWorkspace,
    setWorkspaceUsers,
    activeWorkspace,
  } = useWorkspaceStore((state) => state);

  const { fileType } = useParams();

  // determine title for SiteHeader
  const getPageTitle = () => {
    if (fileType) return fileType;
    if (location.pathname.includes('settings')) return 'Settings';
    return 'Dashboard';
  };

  // fetch current user
  useEffect(() => {
    const fetchUserData = async () => {
      const { data } = await api.get(
        `${apiRoutes.users.base}${apiRoutes.users.getProfile}`
      );
      setUser(data);
      const workspaces = data.memberships.map((m) => m.workspace);
      setWorkspaces(workspaces);
      setActiveWorkspace(workspaces[0]);
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
