import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export type { UserType, FileType, File, Org } from '@prisma/client';
