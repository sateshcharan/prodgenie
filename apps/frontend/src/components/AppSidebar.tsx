import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpCircleIcon } from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  NavMain,
  NavDocuments,
  NavConfigurations,
  NavBuilders,
  NavSecondary,
  NavUser,
} from '@prodgenie/libs/ui';
import { useUserStore } from '@prodgenie/libs/store';
import { apiRoutes, appSidebarItems } from '@prodgenie/libs/constant';
import { StringService } from '@prodgenie/libs/frontend-services';

import { api } from '../utils';

const stringService = new StringService();

export default function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const user = useUserStore((state) => state.user);
  // const setUser = useUserStore((state) => state.setUser);

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       const { data } = await api.get(`${apiRoutes.users.base}/getProfile/me`);
  //       setUser(data);
  //     } catch (error) {
  //       console.error('Failed to fetch user data:', error);
  //     }
  //   };

  //   fetchUserData();
  // }, [setUser]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/dashboard">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold capitalize">
                  {/* {user?.org && stringService.camelToNormal(user?.org?.name)} */}
                  {user?.org && stringService.camelToNormal(user?.org?.name)}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={appSidebarItems.navMain} />
        <NavDocuments items={appSidebarItems.documents} />
        <NavConfigurations items={appSidebarItems.configs} />
        <NavBuilders items={appSidebarItems.builders} />
        <NavSecondary
          items={appSidebarItems.navSecondary}
          className="mt-auto"
        />
      </SidebarContent>

      <SidebarFooter>{user ? <NavUser user={user} /> : null}</SidebarFooter>
    </Sidebar>
  );
}
