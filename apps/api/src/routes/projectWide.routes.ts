import express, { Router } from 'express';

import { asyncHandler, cache } from '../middlewares/index.js';
import { ProjectWideController } from '../controllers/index.js';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.get(
  apiRoutes.projectWide.getPlans,
  cache(300),
  asyncHandler(ProjectWideController.getPlans)
);

export { router };
