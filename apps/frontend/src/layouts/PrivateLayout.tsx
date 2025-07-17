import { Outlet, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../utils';

import { AppSidebar } from '../components';
import { PrivateHeader } from '../navigation';

import { apiRoutes } from '@prodgenie/libs/constant';
import { useUserStore } from '@prodgenie/libs/store';
import { SidebarInset, SidebarProvider, SiteHeader } from '@prodgenie/libs/ui';

const PrivateLayout = () => {
  const setUser = useUserStore((state) => state.setUser);
  let { fileType } = useParams();

  !fileType && (fileType = 'Dashboard');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await api.get(`${apiRoutes.users.base}/getProfile/me`);
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
  }, [setUser]);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <PrivateHeader />
        <SiteHeader title={fileType} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PrivateLayout;
