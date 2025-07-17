import { prisma } from '@prodgenie/libs/prisma';
import { FileStorageService } from '@prodgenie/libs/supabase';

const fileStorageService = new FileStorageService();
export class OrgService {
  static async checkOrgExists(orgName: string) {
    const org = await prisma.org.findUnique({
      where: { name: orgName },
    });

    return org ? true : false;
  }

  static async getOrgUser(orgId: string) {
    if (!orgId) return [];
    const users = await prisma.user.findMany({
      where: {
        orgId,
        name: {
          not: 'admin',
        },
      },
    });
    return users;
  }

  static async getOrgConfig(orgId: string, configName: string) {
    const config = await prisma.file.findFirst({
      where: {
        orgId: orgId,
        type: 'config',
        name: configName,
      },
    });
    if (!config) return null;
    const signedUrl = await fileStorageService.getSignedUrl(config?.path);
    config.path = signedUrl;
    return config;
  }

  static async getOrgHistory(orgId: string) {
    const history = await prisma.history.findMany({
      where: {
        orgId: orgId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return history;
  }
}
