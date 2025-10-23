// import type { WorkspaceRole } from '@prodgenie/libs/prisma';

import * as schema from '@prodgenie/libs/schema';

// prisma types

export const WorkspaceRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export const FileType = {
  drawing: 'drawing',
  template: 'template',
  sequence: 'sequence',
  jobCard: 'jobCard',
  config: 'config',
  table: 'table',
} as const;

export const EventType = {
  userInvited: 'USER_INVITED',
  userJoined: 'USER_JOINED',
  fileUploaded: 'FILE_UPLOADED',
  jobCreated: 'JOB_CREATED',
  jobProcessing: 'JOB_PROCESSING',
  jobCompleted: 'JOB_COMPLETED',
  jobFailed: 'JOB_FAILED',
  planChanged: 'PLAN_CHANGED',
  manualTopup: 'MANUAL_TOPUP',
  description: 'SUBSCRIPTION',
};

export type EventType = (typeof EventType)[keyof typeof EventType];

export type WorkspaceRole = (typeof WorkspaceRole)[keyof typeof WorkspaceRole];

export const WorkspaceRoleHierarchy: Record<WorkspaceRole, number> = {
  [WorkspaceRole.OWNER]: 2,
  [WorkspaceRole.ADMIN]: 1,
  [WorkspaceRole.MEMBER]: 0,
};

export type FileType = (typeof FileType)[keyof typeof FileType];

// zod types
export type loginSchema = schema.loginSchema;
export type signupSchema = schema.signupSchema;
export type fileSchema = schema.FileSchema;
export type userSchema = schema.UserSchema;
export type organizationSchema = schema.OrganizationSchema;

// other types
export * from './lib/card.js';
export * from './lib/JobCard.js';
export * from './lib/form.js';
export * from './lib/bom.js';
