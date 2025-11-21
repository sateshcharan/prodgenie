import { Handshake, Trash, LogOut } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@prodgenie/libs/ui/avatar';
import { ScrollArea, ScrollBar } from '@prodgenie/libs/ui/scroll-area';
import { Card } from '@prodgenie/libs/ui/card';
import { Button } from '@prodgenie/libs/ui/button';
import {
  useWorkspaceStore,
  useUserStore,
  useModalStore,
} from '@prodgenie/libs/store';
import { ROLE_PRIORITY } from '@prodgenie/libs/constant';

const WorkspaceUsers = () => {
  const { workspaceUsers, activeWorkspace, activeWorkspaceRole } =
    useWorkspaceStore((state) => state);
  const { user } = useUserStore((state) => state);
  const { openModal } = useModalStore((state) => state);

  const currentUserRole = activeWorkspaceRole;

  const handleRemoveUserFromWorkspace = (workspaceUserId: string) => {
    openModal('workspace:removeUserFromWorkspace', { workspaceUserId });
  };

  const handleChangeUserRole = (workspaceUserId: string) => {
    openModal('workspace:editUserRole', { workspaceUserId });
    // fetchWorkspaceUsers(activeWorkspace?.id );
  };

  const handleInviteUserToWorkspace = () => {
    openModal('workspace:inviteUser');
  };

  const handleLeaveWorkspace = () => {
    openModal('workspace:leaveWorkspace', { workspaceId: activeWorkspace?.id });
  };

  const canInvite =
    ROLE_PRIORITY[currentUserRole as any] > ROLE_PRIORITY['MEMBER'];

  return (
    <Card className="p-4 h-full">
      <div className="space-y-2 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Your Team</h2>
        <h2>
          <strong>Workspace Name:</strong> {activeWorkspace?.name}
        </h2>
      </div>

      <div className="space-y-2">
        {workspaceUsers.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No users found in this workspace.
          </p>
        ) : (
          <ScrollArea>
            <ul className="flex flex-wrap gap-2">
              {workspaceUsers.map((workspaceUser) => {
                const targetRole = workspaceUser.role;
                const isSelf = user?.id === workspaceUser.user.id;

                const canEditThisUser =
                  ROLE_PRIORITY[currentUserRole as any] >
                  ROLE_PRIORITY[targetRole];
                const owners = workspaceUsers.filter(
                  (wu) => wu.role === 'OWNER'
                );
                const isLastOwner =
                  owners.length === 1 && owners[0].userId === user?.id;

                // console.log('targetRole', targetRole);
                // console.log('currentUserRole', currentUserRole);

                return (
                  <li
                    key={workspaceUser.id}
                    className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg w-56"
                  >
                    <Avatar className="h-10 w-10 rounded-lg grayscale">
                      <AvatarImage
                        src={workspaceUser.avatar}
                        alt={workspaceUser?.user?.name}
                      />
                      <AvatarFallback className="rounded-lg">
                        {workspaceUser?.user.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-sm">
                          {workspaceUser.user.name}
                        </span>

                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            workspaceUser.status === 'PENDING'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          title={
                            workspaceUser.status === 'PENDING'
                              ? 'Pending invite'
                              : 'Active'
                          }
                        />
                      </div>
                      <span className="truncate text-xs text-muted-foreground capitalize">
                        {workspaceUser.role}
                      </span>
                    </div>

                    {isSelf ? (
                      !isLastOwner && (
                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-7"
                          onClick={handleLeaveWorkspace}
                        >
                          <LogOut className="h-3 w-3" />
                        </Button>
                      )
                    ) : canEditThisUser ? (
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-7"
                          onClick={() =>
                            handleRemoveUserFromWorkspace(workspaceUser.userId)
                          }
                        >
                          <Trash className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-7"
                          onClick={() =>
                            handleChangeUserRole(workspaceUser.userId)
                          }
                        >
                          <Handshake className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-7" />
                    )}
                  </li>
                );
              })}

              {canInvite && (
                <li
                  key="add-user"
                  className="flex flex-col items-center justify-center bg-muted/20 p-2 rounded-lg w-40 cursor-pointer hover:bg-muted/40 transition"
                  onClick={handleInviteUserToWorkspace}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <span className="text-lg">+</span>
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Add User
                  </span>
                </li>
              )}
            </ul>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </Card>
  );
};

export default WorkspaceUsers;
