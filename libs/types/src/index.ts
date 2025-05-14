import type { UserType, FileType, File, Org } from '@prodgenie/libs/prisma';

import * as schema from '@prodgenie/libs/schema';

// prisma types
// export type userType = UserType;
// export type fileType = FileType;
// export type file = File;
// export type org = Org;
export type { UserType, FileType, File, Org };

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
