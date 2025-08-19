import express, { Router } from 'express';

import { WorkspaceController } from '../controllers';
import {
  authenticateSupabaseJWT,
  // authenticatePassportJWT,
  asyncHandler,
} from '../middlewares';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.get(
  apiRoutes.workspace.check,
  asyncHandler(WorkspaceController.checkWorkspaceExists)
);

router.get(
  apiRoutes.workspace.getWorkspaceUsers,
  authenticateSupabaseJWT,
  // authenticatePassportJWT,
  asyncHandler(WorkspaceController.getWorkspaceUsers)
);

router.get(
  apiRoutes.workspace.getWorkspaceConfig(':configName'),
  authenticateSupabaseJWT,
  // authenticatePassportJWT,
  asyncHandler(WorkspaceController.getWorkspaceConfig)
);

// Assuming getWorkspaceHistory uses a route param like /workspace/:workspaceId/history
router.get(
  apiRoutes.workspace.getWorkspaceHistory,
  authenticateSupabaseJWT,
  // authenticatePassportJWT,
  asyncHandler(WorkspaceController.getWorkspaceHistory)
);

router.post(
  apiRoutes.workspace.createNewWorkspace,
  authenticateSupabaseJWT,
  asyncHandler(WorkspaceController.createNewWorkspace)
);

export { router };
