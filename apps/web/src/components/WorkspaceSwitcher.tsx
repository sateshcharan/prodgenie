import { ChevronsUpDown, Plus, Trash } from 'lucide-react';

import {
  useUserStore,
  useWorkspaceStore,
  useModalStore,
} from '@prodgenie/libs/store';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@prodgenie/libs/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@prodgenie/libs/ui/dropdown-menu';
import { Button } from '@prodgenie/libs/ui/button';
import { useSidebar } from '@prodgenie/libs/ui/sidebar';
import { apiRoutes, appSidebarItems } from '@prodgenie/libs/constant';

import api from '../utils/api';

export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar();
  const { user } = useUserStore((state) => state);
  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    setWorkspaceUsers,
    setWorkspaceEvents,
    initRealtime,
  } = useWorkspaceStore((state) => state);
  const { openModal, closeModal } = useModalStore((state) => state);

  const userRoleinActiveWorkspace = user?.memberships.find(
    (m) => m.workspaceId === activeWorkspace.id
  )?.role;

  const logoFallback =
    appSidebarItems.workspaceLogos[
      Math.floor(Math.random() * appSidebarItems.workspaceLogos.length)
    ];

  const ActiveLogo = activeWorkspace.logo || logoFallback;

  const handleSwitchWorkspace = async (workspaceId: string) => {
    const currentMembership = user?.memberships.find(
      (m) => m.workspaceId === workspaceId
    );
    setActiveWorkspace(currentMembership.workspace);
    const {
      data: { workspaceUsers, workspaceEvents },
    } = await api.get(
      `${apiRoutes.batched.base}${apiRoutes.batched.workspaceChange}`,
      {
        params: { workspaceId },
      }
    );
    setWorkspaceUsers(workspaceUsers);
    setWorkspaceEvents(workspaceEvents);
    initRealtime(workspaceId);
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    openModal('workspace:delete', { workspaceId });
    closeModal();
  };

  const handleCreateWorkspace = (workspaceName: string) => {
    openModal('workspace:create');
    closeModal();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ActiveLogo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeWorkspace.name}
                </span>
                <div className="flex gap-2">
                  <span className="truncate text-xs">
                    {activeWorkspace.plan?.name || 'No Plan'}
                  </span>
                  <span className="text-xs">
                    {userRoleinActiveWorkspace.toLowerCase()}
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Workspaces
            </DropdownMenuLabel>

            {workspaces.map((workspace, index) => {
              const WorkspaceLogo =
                workspace.logo ||
                appSidebarItems.workspaceLogos[
                  index % appSidebarItems.workspaceLogos.length
                ];

              return (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => handleSwitchWorkspace(workspace.id)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <WorkspaceLogo className="size-3.5 shrink-0" />
                  </div>
                  {workspace.name}

                  {workspace.id !== activeWorkspace.id && (
                    <DropdownMenuShortcut>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-7"
                        onClick={() => handleDeleteWorkspace(workspace.id)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => handleCreateWorkspace(workspaces.id)}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add workspace
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
