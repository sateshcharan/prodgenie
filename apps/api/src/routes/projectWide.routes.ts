import express, { Router } from 'express';

import { apiRoutes } from '@prodgenie/libs/constant';

import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { ProjectWideController } from '../controllers/projectWide.controller';

const router: Router = express.Router();

router.get(
  apiRoutes.projectWide.getPlans,
  asyncHandler(ProjectWideController.getPlans)
);

export { router };
