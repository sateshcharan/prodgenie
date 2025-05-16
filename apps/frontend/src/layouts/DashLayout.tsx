import { Outlet } from 'react-router-dom';

import { SidebarInset, SidebarProvider, SiteHeader } from '@prodgenie/libs/ui';

import { AppSidebar } from '../pages/AppSidebar';
import { PrivateHeader } from '../navigation';

const DashLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <PrivateHeader />
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashLayout;
