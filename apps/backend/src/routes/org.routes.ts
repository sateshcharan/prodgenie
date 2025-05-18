import express, { Router } from 'express';

import { OrgController } from '../controllers/org.controller.js';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.get(apiRoutes.orgs.check, OrgController.checkOrgExists);
router.get(apiRoutes.orgs.getOrgUsers, OrgController.getOrgUsers);

export { router };
