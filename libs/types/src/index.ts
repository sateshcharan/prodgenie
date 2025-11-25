// import type { WorkspaceRole } from '@prodgenie/libs/prisma';

import * as schema from '@prodgenie/libs/schema';

// prisma types

export const workspaceRole = {
  owner: 'owner',
  admin: 'admin',
  member: 'member',
} as const;

export const fileType = {
  drawing: 'drawing',
  template: 'template',
  sequence: 'sequence',
  jobCard: 'jobCard',
  config: 'config',
  table: 'table',
} as const;

export const eventType = {
  userInvited: 'user_invited',
  userJoined: 'user_joined',
  fileUploaded: 'file_uploaded',
  jobCreated: 'job_created',
  jobProcessing: 'job_processing',
  jobCompleted: 'job_completed',
  jobFailed: 'job_failed',
  planChanged: 'plan_changed',
  manualTopup: 'manual_topup',
  description: 'subscription',
};

export type fileType = (typeof fileType)[keyof typeof fileType];
export type eventType = (typeof eventType)[keyof typeof eventType];
export type workspaceRole = (typeof workspaceRole)[keyof typeof workspaceRole];

export const workspaceRoleHierarchy: Record<workspaceRole, number> = {
  [workspaceRole.owner]: 2,
  [workspaceRole.admin]: 1,
  [workspaceRole.member]: 0,
};


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
