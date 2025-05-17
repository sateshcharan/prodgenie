import { prisma } from '@prodgenie/libs/prisma';

export class OrgService {
  static async checkOrgExists(orgName: string) {
    const org = await prisma.org.findUnique({
      where: { name: orgName },
    });

    return org ? true : false;
  }

  static async getOrgUser(orgId: string) {
    const users = await prisma.user.findMany({
      where: {
        orgId: orgId,
      },
    });
    return users;
  }
}
