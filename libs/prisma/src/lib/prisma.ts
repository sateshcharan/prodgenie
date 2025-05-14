import { PrismaClient, UserType, FileType, File, Org } from '@prisma/client';

const prisma = new PrismaClient();

export { prisma };
export type { UserType, FileType, File, Org };
