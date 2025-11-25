import { Request, Response, NextFunction } from 'express';

import { prisma } from '@prodgenie/libs/db';
// import { prisma, workspacePlan } from '@prodgenie/libs/db';
import { workspaceRoleHierarchy } from '@prodgenie/libs/types';

// const PLAN_LIMITS: Record<workspacePlan, Record<string, number>> = {
const PLAN_LIMITS: any = {
  FREE: {
    MAX_MEMBERS: 3,
    MAX_FILES: 20,
    MAX_STORAGE_MB: 100,
  },
  PRO: {
    MAX_MEMBERS: 10,
    MAX_FILES: 200,
    MAX_STORAGE_MB: 5000,
  },
  ENTERPRISE: {
    MAX_MEMBERS: 999,
    MAX_FILES: 9999,
    MAX_STORAGE_MB: 999999,
  },
};

/**
 * Middleware to validate workspace plan limits and permissions.
 * Optionally accepts a `check` parameter to define which limit to check.
 */
const validatePlan =
  (check?: keyof (typeof PLAN_LIMITS)['FREE']) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      const activeWorkspaceId = (req as any).activeWorkspaceId;

      if (!user || !activeWorkspaceId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User or workspace not found in request.',
        });
      }

      // Step 1: Fetch workspace & plan
      const workspace = await prisma.workspace.findUnique({
        where: { id: activeWorkspaceId },
        select: { id: true, plan: true },
      });

      if (!workspace) {
        return res.status(404).json({
          error: 'WORKSPACE_NOT_FOUND',
          message: 'The active workspace could not be found.',
        });
      }

      // const plan = workspace.plan as workspacePlan;
      const plan = workspace.plan;
      const limits = PLAN_LIMITS[plan];

      // Step 2: If no specific check provided, just verify plan exists
      if (!check) {
        return next();
      }

      // Step 3: Check specific limit
      switch (check) {
        case 'MAX_MEMBERS': {
          const count = await prisma.workspaceMember.count({
            where: { workspaceId: workspace.id, isDeleted: false },
          });
          if (count >= limits.MAX_MEMBERS) {
            return res.status(403).json({
              error: 'PLAN_LIMIT_EXCEEDED',
              action: 'UPGRADE_PLAN',
              message: `You’ve reached the member limit for the ${plan} plan. Please upgrade to add more members.`,
            });
          }
          break;
        }

        case 'MAX_FILES': {
          const count = await prisma.file.count({
            where: { workspaceId: workspace.id, isDeleted: false },
          });
          if (count >= limits.MAX_FILES) {
            return res.status(403).json({
              error: 'PLAN_LIMIT_EXCEEDED',
              action: 'UPGRADE_PLAN',
              message: `You’ve reached the file limit for the ${plan} plan.`,
            });
          }
          break;
        }

        case 'MAX_STORAGE_MB': {
          // Optional: if you track file sizes
          const files = await prisma.file.findMany({
            where: { workspaceId: workspace.id, isDeleted: false },
            select: { size: true },
          });
          const totalMB =
            files.reduce((sum, f) => sum + (f.size || 0), 0) / (1024 * 1024);
          if (totalMB >= limits.MAX_STORAGE_MB) {
            return res.status(403).json({
              error: 'PLAN_LIMIT_EXCEEDED',
              action: 'UPGRADE_PLAN',
              message: `Storage limit exceeded for the ${plan} plan.`,
            });
          }
          break;
        }

        default:
          break;
      }

      // Step 4: All good → continue
      return next();
    } catch (err: any) {
      console.error('validatePlan error:', err);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Failed to validate workspace plan.',
        details: err.message,
      });
    }
  };

export { validatePlan };
