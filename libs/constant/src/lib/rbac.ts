// export type Role = 'owner' | 'admin' | 'member';
import { WorkspaceRole } from '@prisma/client';

export const ROLE_PRIORITY: Record<WorkspaceRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

// Optional fine-grained actions
export const ROLE_PERMISSIONS = {
  OWNER: ['invite_user', 'remove_user', 'change_role', 'delete_workspace'],
  ADMIN: ['invite_user', 'remove_user', 'change_role'],
  MEMBER: [],
} as const;
