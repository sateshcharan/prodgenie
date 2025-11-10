import { prisma } from '@prodgenie/libs/db';

export class ProjectWideService {
  static async getPlans() {
    return await prisma.plan.findMany();
  }
}
