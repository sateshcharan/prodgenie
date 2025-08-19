import { prisma } from '@prodgenie/libs/prisma';

export class ProjectWideService {
  static async getPlans() {
    return await prisma.plan.findMany();
  }
}
