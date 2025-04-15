import { Outlet } from 'react-router-dom';
import { Footer, DashHeader } from '@prodgenie/libs/ui';

import { SidebarProvider, SidebarTrigger } from '@prodgenie/libs/ui';
import { AppSidebar,UtilityBar } from '@prodgenie/libs/ui';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <DashHeader />
      <UtilityBar />
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
