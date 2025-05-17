import React, { useState, useEffect } from 'react';
import { ArrowUpCircleIcon } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  NavDocuments,
  NavMain,
  NavSecondary,
  NavUser,
} from '@prodgenie/libs/ui';
import { appSidebarItems } from '@prodgenie/libs/constant';

import { api } from '../utils';

export default function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState({
    name: '',
    email: '',
    avatar: '',
  });
  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await api.get('/api/users/getProfile/me');
      setUserData(userData.data);
      setUser({
        name: userData.data.name,
        email: userData.data.email,
        avatar: userData.data.avatar,
      });
    };
    fetchUserData();
  }, []);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">
                  {userData?.org?.name.charAt(0).toUpperCase() +
                    userData?.org?.name.slice(1)}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={appSidebarItems.navMain} />
        <NavDocuments items={appSidebarItems.documents} />
        <NavSecondary
          items={appSidebarItems.navSecondary}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
