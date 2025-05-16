// import type { UserType, File, Org } from '@prodgenie/libs/prisma';

import * as schema from '@prodgenie/libs/schema';

// prisma types
// export type { UserType, File, Org };
export const FileType = {
  drawing: 'drawing',
  template: 'template',
  sequence: 'sequence',
  jobCard: 'jobCard',
  config: 'config',
} as const;

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
