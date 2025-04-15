import { prisma } from '@prodgenie/libs/prisma';
import * as schema from '@prodgenie/libs/schema';

// prisma types
export type UserType = prisma.UserType;
export type File = prisma.File;
export type FileType = prisma.FileType;
export type Organization = prisma.Organization;

// zod types
export type loginSchema = schema.loginSchema;
export type signupSchema = schema.signupSchema;
export type fileSchema = schema.FileSchema;
export type userSchema = schema.UserSchema;
export type organizationSchema = schema.OrganizationSchema;
export type UserTypeEnum = schema.UserTypeEnum;
export type FileTypeEnum = schema.FileTypeEnum;


