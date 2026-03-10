import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpCircleIcon, GalleryVerticalEnd } from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@prodgenie/libs/ui/sidebar';
import { StringService } from '@prodgenie/libs/shared-utils';
import { NavUser } from '@prodgenie/libs/ui/components/nav-user';
import { NavMain } from '@prodgenie/libs/ui/components/nav-main';
import { apiRoutes, appSidebarItems } from '@prodgenie/libs/constant';
import { useUserStore, useWorkspaceStore } from '@prodgenie/libs/store';
import { NavBuilders } from '@prodgenie/libs/ui/components/nav-builder';
import { NavSecondary } from '@prodgenie/libs/ui/components/nav-secondary';
import { NavDocuments } from '@prodgenie/libs/ui/components/nav-documents';
import { NavConfigurations } from '@prodgenie/libs/ui/components/nav-configurations';

import api from '../utils/api';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

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
