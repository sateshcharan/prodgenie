export type Role = 'owner' | 'admin' | 'member';
// import { workspaceRole } from '@prisma/client';

export const ROLE_PRIORITY: Record<Role, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

// Optional fine-grained actions
export const ROLE_PERMISSIONS = {
  owner: ['invite_user', 'remove_user', 'change_role', 'delete_workspace'],
  admin: ['invite_user', 'remove_user', 'change_role'],
  member: [],
} as const;
