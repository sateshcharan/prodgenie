import { User } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

import { WorkspaceRole, WorkspaceRoleHierarchy } from '@prodgenie/libs/types';

const requireRole = (minRole: WorkspaceRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    // const { workspaceId } = req.body;
    const activeWorkspaceId = req.activeWorkspaceId;

    const { role } = user?.memberships?.find(
      // (m) => m.workspace.id === workspaceId
      (m) => m.workspace.id === activeWorkspaceId
    );

    if (WorkspaceRoleHierarchy[role] >= WorkspaceRoleHierarchy[minRole]) {
      return next();
    }
    return res.status(403).json({
      error: 'You do not have permission to perform this action.',
      action: 'CONTACT_OWNER',
      message:
        'You do not have permission to perform this action. Please contact the workspace Owner or Admin if you need access.',
    });
  };
};

export { requireRole };
