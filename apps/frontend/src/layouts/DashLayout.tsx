import { Outlet } from 'react-router-dom';

import { SidebarProvider, SidebarTrigger } from '@prodgenie/libs/ui';
import { AppSidebar } from '@prodgenie/libs/ui';
import { PrivateHeader } from '../navigation';
const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <PrivateHeader />
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-grow p-4">
          {/* <SidebarTrigger /> */}
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
