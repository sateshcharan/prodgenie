import { Outlet, useParams } from 'react-router-dom';

import { AppSidebar } from '../components';
import { PrivateHeader } from '../navigation';

import { SidebarInset, SidebarProvider, SiteHeader } from '@prodgenie/libs/ui';

const PrivateLayout = () => {
  let { fileType } = useParams();

  !fileType && (fileType = 'Dashboard');

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
