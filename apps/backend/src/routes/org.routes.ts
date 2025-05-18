import express, { Router } from 'express';

import { OrgController } from '../controllers/index.js';
import { authenticateJWT } from '../middlewares/index.js';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.get(apiRoutes.orgs.check, OrgController.checkOrgExists);
router.get(
  apiRoutes.orgs.getOrgUsers,
  authenticateJWT,
  authenticateJWT,
  OrgController.getOrgUsers
);
router.get(
  apiRoutes.orgs.getOrgHistory,
  authenticateJWT,
  OrgController.getOrgHistory
);

export { router };
