import express, { Router } from 'express';

import { apiRoutes } from '@prodgenie/libs/constant';
import { workspaceRole } from '@prodgenie/libs/types';

import { requireRole } from '../middlewares/user.middleware';
import { validatePlan } from '../middlewares/plan.middleware';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { WorkspaceController } from '../controllers/workspace.controller';
import { authenticateSupabaseJWT } from '../middlewares/supabase.middleware';
// import { authenticatePassportJWT } from '../middlewares/passport.middleware';

const router: Router = express.Router();

router.post(
  apiRoutes.workspace.createWorkspace,
  authenticateSupabaseJWT,
  asyncHandler(WorkspaceController.createWorkspace)
);

router.post(
  apiRoutes.workspace.deleteWorkspace,
  authenticateSupabaseJWT,
  requireRole(workspaceRole.owner),
  asyncHandler(WorkspaceController.deleteWorkspace)
);

router.post(
  apiRoutes.workspace.deleteAccount,
  authenticateSupabaseJWT,
  // requireRole(workspaceRole.owner),
  asyncHandler(WorkspaceController.deleteAccount)
);

router.post(
  apiRoutes.workspace.removeUserFromWorkspace,
  authenticateSupabaseJWT,
  requireRole(workspaceRole.admin),
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
  apiRoutes.workspace.getJobCardStats(':workspaceId', ':days'),
  authenticateSupabaseJWT,
  // authenticatePassportJWT,
  asyncHandler(WorkspaceController.getJobCardStats)
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

// === future features ===
// router.post(
//   apiRoutes.workspace.inviteUserToWorkspace,
//   // validatePlan,
//   authenticateSupabaseJWT,
//   // requireRole(workspaceRole.admin),
//   asyncHandler(WorkspaceController.inviteUserToWorkspace)
// );

// router.post(
//   apiRoutes.workspace.acceptInvite,
//   authenticateSupabaseJWT,
//   asyncHandler(WorkspaceController.acceptInvite)
// );

// router.post(
//   apiRoutes.workspace.rejectInvite,
//   authenticateSupabaseJWT,
//   asyncHandler(WorkspaceController.rejectInvite)
// );

export { router };
