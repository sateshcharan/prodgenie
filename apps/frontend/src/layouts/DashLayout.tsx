import { Outlet } from 'react-router-dom';
import { Footer, DashHeader } from '@prodgenie/apps/ui';

import { SidebarProvider, SidebarTrigger } from '@prodgenie/apps/ui';
import { AppSidebar } from '@prodgenie/apps/ui';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <DashHeader />
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-grow p-4">
          {/* <SidebarTrigger /> */}
          <Outlet />
        </main>
      </SidebarProvider>
      <Footer />
    </div>
  );
};

export default Layout;
