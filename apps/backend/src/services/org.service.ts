import { prisma } from '@prodgenie/libs/prisma';

export class OrgService {
  static async checkOrgExists(orgName: string) {
    const org = await prisma.org.findUnique({
      where: { name: orgName },
    });

    return org ? true : false;
  }
}
