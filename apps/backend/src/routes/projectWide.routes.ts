import express, { Router } from 'express';

import { ProjectWideController } from '../controllers/index.js';
import { asyncHandler } from '../middlewares/index.js';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.get(
  apiRoutes.projectWide.getPlans,
  asyncHandler(ProjectWideController.getPlans)
);

export { router };
