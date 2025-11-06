import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpCircleIcon, GalleryVerticalEnd } from 'lucide-react';

import { api } from '../utils';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  NavMain,
  NavDocuments,
  NavConfigurations,
  NavBuilders,
  NavSecondary,
  NavUser,
} from '@prodgenie/libs/ui';
import { StringService } from '@prodgenie/libs/shared-utils';
import { apiRoutes, appSidebarItems } from '@prodgenie/libs/constant';
import { useUserStore, useWorkspaceStore } from '@prodgenie/libs/store';

const stringService = new StringService();

export default function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const { workspaces } = useWorkspaceStore((state) => state);
  const user = useUserStore((state) => state.user);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        {workspaces?.length > 0 && <WorkspaceSwitcher />}
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
