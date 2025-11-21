import { ChevronsUpDown, Plus, Trash } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@prodgenie/libs/ui/dropdown-menu';
import { useSidebar } from '@prodgenie/libs/ui/sidebar';
import { Button } from '@prodgenie/libs/ui/button';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@prodgenie/libs/ui/sidebar';
import {
  useUserStore,
  useWorkspaceStore,
  useModalStore,
} from '@prodgenie/libs/store';
import { appSidebarItems } from '@prodgenie/libs/constant';

export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar();
  const { user } = useUserStore((state) => state);
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceStore(
    (state) => state
  );
  const { openModal } = useModalStore((state) => state);

  const userRoleinActiveWorkspace = user?.memberships.find(
    (m) => m.workspaceId === activeWorkspace.id
  )?.role;

  const logoFallback =
    appSidebarItems.workspaceLogos[
      Math.floor(Math.random() * appSidebarItems.workspaceLogos.length)
    ];

  const ActiveLogo = activeWorkspace.logo || logoFallback;

  const handleDeleteWorkspace = (workspaceId: string) => {
    openModal('workspace:delete', { workspaceId });
  };

  const handleCreateWorkspace = (workspaceName: string) => {
    openModal('workspace:create');
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
                  onClick={() => setActiveWorkspace(workspace)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <WorkspaceLogo className="size-3.5 shrink-0" />
                  </div>
                  {workspace.name}

                  {/* Only show delete if it's not the active workspace */}
                  {workspace.id !== activeWorkspace.id && (
                    <DropdownMenuShortcut>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkspace(workspace.id);
                        }}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={(e) => {
                e.stopPropagation();
                handleCreateWorkspace('');
              }}
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
