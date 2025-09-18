// import { useState, useEffect } from 'react';
// import { Copy, Handshake, Trash } from 'lucide-react';

// import { api } from '../utils';

// import {
//   Button,
//   Card,
//   Avatar,
//   AvatarFallback,
//   AvatarImage,
//   ScrollArea,
//   ScrollBar,
// } from '@prodgenie/libs/ui';
// import { apiRoutes } from '@prodgenie/libs/constant';
// import {
//   useWorkspaceStore,
//   useUserStore,
//   useModalStore,
// } from '@prodgenie/libs/store';
// import { WorkspaceRole } from '@prodgenie/libs/types';

// const WorkspaceUsers = () => {
//   const [inviteCode, setInviteCode] = useState('');
//   const [copied, setCopied] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [inviteLoading, setInviteLoading] = useState(false);

//   const { workspaceUsers, activeWorkspace } = useWorkspaceStore(
//     (state) => state
//   );
//   const { user } = useUserStore((state) => state);
//   const { openModal } = useModalStore((state) => state);

//   // const handleGenerateInviteCode = async () => {
//   //   try {
//   //     setInviteLoading(true);
//   //     const { data } = await api.post(
//   //       `${apiRoutes.auth.base}${apiRoutes.auth.invite.generate}`,
//   //       { workspaceId }
//   //     );
//   //     setInviteCode(data.invite.code);
//   //     setCopied(false);
//   //   } catch (err) {
//   //     console.error('Failed to generate invite code:', err);
//   //   } finally {
//   //     setInviteLoading(false);
//   //   }
//   // };

//   // const handleCopy = async () => {
//   //   if (!inviteCode) return;
//   //   try {
//   //     await navigator.clipboard.writeText(inviteCode);
//   //     setCopied(true);
//   //     setTimeout(() => setCopied(false), 2000);
//   //   } catch (err) {
//   //     console.error('Failed to copy invite code:', err);
//   //   }
//   // };

//   const handleUserDelete = (workspaceUserId: string) => {
//     openModal('workspace:deleteUser');
//   };

//   const handleChangeUserRole = (workspaceUserId: string) => {
//     openModal('workspace:editUserRole');
//   };

//   const handleUserInvite = () => {
//     openModal('workspace:inviteUser');
//   };

//   return (
//     <Card className="p-4 ">
//       <div className="space-y-2 flex items-center justify-between gap-4">
//         <h2 className="text-xl font-semibold">Your Team</h2>

//         <h2>
//           <strong>Workspace ID:</strong> {activeWorkspace?.id}
//         </h2>

//         {/* {!inviteCode && (
//           <Button onClick={handleGenerateInviteCode} disabled={inviteLoading}>
//             {inviteLoading ? 'Generating...' : 'Generate Invite Code'}
//           </Button>
//           <h2>
//             <strong>Workspace ID:</strong> {activeWorkspace?.id}
//           </h2>
//         )} */}

//         {/* {inviteCode && (
//           <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
//             <span className="font-mono bg-muted px-2 py-1 rounded">
//               {inviteCode}
//             </span>
//             <Button
//               variant="ghost"
//               size="icon"
//               className="h-6 w-6"
//               onClick={handleCopy}
//               title={copied ? 'Copied!' : 'Copy'}
//             >
//               <Copy className="h-4 w-4" />
//             </Button>
//             {copied && <span className="text-green-600 text-xs">Copied!</span>}
//           </div>
//         )} */}
//       </div>

//       <div className="space-y-2">
//         {loading ? (
//           <p className="text-muted-foreground text-sm">Loading users...</p>
//         ) : workspaceUsers.length === 0 ? (
//           <p className="text-muted-foreground text-sm">
//             No users found in this workspace.
//           </p>
//         ) : (
//           <ScrollArea>
//             <ul className="flex gap-2">
//               {workspaceUsers.map((workspaceUser) => (
//                 <li
//                   key={workspaceUser.id}
//                   className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg w-56"
//                 >
//                   <Avatar className="h-10 w-10 rounded-lg grayscale">
//                     <AvatarImage
//                       src={workspaceUser.avatar}
//                       alt={workspaceUser?.user?.name}
//                     />
//                     <AvatarFallback className="rounded-lg">
//                       {workspaceUser?.user.name?.slice(0, 2).toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>

//                   <div className="flex flex-col flex-1 min-w-0">
//                     <span className="truncate font-medium text-sm">
//                       {workspaceUser.user.name}
//                     </span>
//                     <span className="truncate text-xs text-muted-foreground capitalize">
//                       {workspaceUser.role}
//                     </span>
//                   </div>

//                   {user?.id !== workspaceUser.userId && (
//                     <div className="flex flex-col gap-1">
//                       <Button
//                         variant="secondary"
//                         size="icon"
//                         className="size-7"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           handleUserDelete(workspaceUser);
//                         }}
//                       >
//                         <Trash className="h-3 w-3" />
//                       </Button>
//                       <Button
//                         variant="secondary"
//                         size="icon"
//                         className="size-7"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           handleChangeUserRole(workspaceUser);
//                         }}
//                       >
//                         <Handshake className="h-3 w-3" />
//                       </Button>
//                     </div>
//                   )}
//                 </li>
//               ))}

//               {/* Add User LI */}
//               {
//                 // user?.role === WorkspaceRole.ADMIN && (
//                 <li
//                   key="add-user"
//                   className="flex flex-col items-center justify-center bg-muted/20 p-2 rounded-lg w-40 cursor-pointer hover:bg-muted/40 transition"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     handleUserInvite();
//                   }}
//                 >
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-8 w-8 rounded-full"
//                   >
//                     <span className="text-lg">+</span>
//                   </Button>
//                   <span className="text-xs text-muted-foreground">
//                     Add User
//                   </span>
//                 </li>
//                 // )
//               }
//             </ul>
//             <ScrollBar orientation="horizontal" />
//           </ScrollArea>
//         )}
//       </div>
//     </Card>
//   );
// };

// export default WorkspaceUsers;

import { useState, useEffect } from 'react';
import { Copy, Handshake, Trash, LogOut } from 'lucide-react';

import { api } from '../../utils';

import {
  Button,
  Card,
  Avatar,
  AvatarFallback,
  AvatarImage,
  ScrollArea,
  ScrollBar,
} from '@prodgenie/libs/ui';
import {
  useWorkspaceStore,
  useUserStore,
  useModalStore,
} from '@prodgenie/libs/store';
import { apiRoutes } from '@prodgenie/libs/constant';
import { WorkspaceRole } from '@prodgenie/libs/types';

const WorkspaceUsers = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  const { workspaceUsers, activeWorkspace, fetchWorkspaceUsers } =
    useWorkspaceStore((state) => state);
  const { user } = useUserStore((state) => state);
  const { openModal } = useModalStore((state) => state);

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

  return (
    <Card className="p-4 ">
      <div className="space-y-2 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Your Team</h2>
        <h2>
          {/* <strong>Workspace ID:</strong> {activeWorkspace?.id} */}
          <strong>Workspace Name:</strong> {activeWorkspace?.name}
        </h2>
      </div>

      <div className="space-y-2">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading users...</p>
        ) : workspaceUsers.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No users found in this workspace.
          </p>
        ) : (
          <ScrollArea>
            <ul className="flex gap-2">
              {workspaceUsers.map((workspaceUser) => (
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

                      {/* Status Dot */}
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

                  {user?.id !== workspaceUser.user.id ? (
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-7"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveUserFromWorkspace(workspaceUser.userId);
                        }}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-7"
                        onClick={(e) => {
                          e.preventDefault();
                          handleChangeUserRole(workspaceUser.userId);
                        }}
                      >
                        <Handshake className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-7"
                        onClick={(e) => {
                          e.preventDefault();
                          handleLeaveWorkspace();
                        }}
                      >
                        <LogOut className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </li>
              ))}

              {/* Add User LI */}
              <li
                key="add-user"
                className="flex flex-col items-center justify-center bg-muted/20 p-2 rounded-lg w-40 cursor-pointer hover:bg-muted/40 transition"
                onClick={(e) => {
                  e.preventDefault();
                  handleInviteUserToWorkspace();
                }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <span className="text-lg">+</span>
                </Button>
                <span className="text-xs text-muted-foreground">Add User</span>
              </li>
            </ul>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </Card>
  );
};

export default WorkspaceUsers;
