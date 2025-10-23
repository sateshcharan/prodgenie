import express, { Router } from 'express';

import { apiRoutes } from '@prodgenie/libs/constant';
import { WorkspaceRole } from '@prodgenie/libs/types';

import { WorkspaceController } from '../controllers';
import {
  authenticateSupabaseJWT,
  // authenticatePassportJWT,
  requireRole,
  asyncHandler,
} from '../middlewares';

const router: Router = express.Router();

router.post(
  apiRoutes.workspace.createWorkspace,
  authenticateSupabaseJWT,
  asyncHandler(WorkspaceController.createWorkspace)
);

router.post(
  apiRoutes.workspace.deleteWorkspace,
  authenticateSupabaseJWT,
  requireRole(WorkspaceRole.OWNER),
  asyncHandler(WorkspaceController.deleteWorkspace)
);

router.post(
  apiRoutes.workspace.inviteUserToWorkspace,
  authenticateSupabaseJWT,
  requireRole(WorkspaceRole.ADMIN),
  asyncHandler(WorkspaceController.inviteUserToWorkspace)
);

router.post(
  apiRoutes.workspace.removeUserFromWorkspace,
  authenticateSupabaseJWT,
  requireRole(WorkspaceRole.ADMIN),
  asyncHandler(WorkspaceController.removeUserFromWorkspace)
);

router.get(
  apiRoutes.workspace.getWorkspaceUsers,
  authenticateSupabaseJWT,
  // authenticatePassportJWT,
  asyncHandler(WorkspaceController.getWorkspaceUsers)
);

router.get(
  apiRoutes.workspace.getWorkspaceEvents,
  authenticateSupabaseJWT,
  // authenticatePassportJWT,
  asyncHandler(WorkspaceController.getWorkspaceEvents)
);

router.get(
  apiRoutes.workspace.check,
  asyncHandler(WorkspaceController.checkWorkspaceExists)
);

router.patch(
  apiRoutes.workspace.updateUserRoleInWorkspace,
  asyncHandler(WorkspaceController.updateUserRoleInWorkspace)
);

router.get(
  apiRoutes.workspace.getWorkspaceConfig(':configName'),
  authenticateSupabaseJWT,
  // authenticatePassportJWT,
  asyncHandler(WorkspaceController.getWorkspaceConfig)
);

router.post(
  apiRoutes.workspace.setWorkspaceConfig(':configName'),
  authenticateSupabaseJWT,
  // authenticatePassportJWT,
  asyncHandler(WorkspaceController.setWorkspaceConfig)
);

router.patch(
  apiRoutes.workspace.updateWorkspaceConfig(':configName'),
  authenticateSupabaseJWT,
  // authenticatePassportJWT,
  asyncHandler(WorkspaceController.updateWorkspaceConfig)
);

export { router };
