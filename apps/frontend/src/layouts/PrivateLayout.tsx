import {
  useEffect,
  // useState
} from 'react';
import { Outlet, useParams } from 'react-router-dom';

import {
  useUserStore,
  useWorkspaceStore,
  // useWorkspaceModalStore,
} from '@prodgenie/libs/store';
import { apiRoutes } from '@prodgenie/libs/constant';
import { SidebarInset, SidebarProvider, SiteHeader } from '@prodgenie/libs/ui';

// import DeleteUser from '../components/DeleteUser';
import {
  AppSidebar,
  //  CreateWorkspace,
  ModalManager,
} from '../components';
import { api } from '../utils';
import { PrivateHeader } from '../navigation';
import ChatWidget from '../components/ChatWidget';

const PrivateLayout = () => {
  const setUser = useUserStore((state) => state.setUser);
  const {
    setWorkspaces,
    setActiveWorkspace,
    setWorkspaceUsers,
    activeWorkspace,
  } = useWorkspaceStore((state) => state);

  // const { modalType } = useWorkspaceModalStore((state) => state);

  let { fileType } = useParams();

  // determine title for SiteHeader
  const getPageTitle = () => {
    if (fileType) return fileType; // param-based routes
    if (location.pathname.includes('settings')) return 'Settings';
    return 'Dashboard';
  };

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

      <ChatWidget />

      <ModalManager />
    </>
  );
};

export default PrivateLayout;
