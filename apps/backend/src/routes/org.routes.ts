import express, { Router } from 'express';

import { OrgController } from '../controllers';
import {
  authenticateSupabaseJWT,
  authenticatePassportJWT,
  asyncHandler,
} from '../middlewares';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.get(apiRoutes.orgs.check, asyncHandler(OrgController.checkOrgExists));

router.get(
  apiRoutes.orgs.getOrgUsers,
  // authenticateSupabaseJWT,
  authenticatePassportJWT,
  asyncHandler(OrgController.getOrgUsers)
);

router.get(
  apiRoutes.orgs.getOrgConfig(':configName'),
  // authenticateSupabaseJWT,
  authenticatePassportJWT,
  asyncHandler(OrgController.getOrgConfig)
);

// Assuming getOrgHistory uses a route param like /orgs/:orgId/history
router.get(
  apiRoutes.orgs.getOrgHistory,
  // authenticateSupabaseJWT,
  authenticatePassportJWT,
  asyncHandler(OrgController.getOrgHistory)
);

export { router };
