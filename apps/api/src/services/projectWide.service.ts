import { prisma } from '@prodgenie/libs/db';
import { cache } from '@prodgenie/libs/redis';

export class ProjectWideService {
  static async getPlans() {
    return cache.getOrSet('pricing:data', 24 * 60 * 60, async () => {
      return await prisma.plan.findMany({
        orderBy: { createdAt: 'asc' },
      });
    });
  }
}
