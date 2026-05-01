import express, { Router } from 'express';

import { apiRoutes } from '@prodgenie/libs/constant';

import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { JobCardController } from '../controllers/jobCard.controller.js';
import {
  validatePlanExpiry,
  validateCredits,
} from '../middlewares/plan.middleware';

const router: Router = express.Router();

router.post(
  apiRoutes.jobCard.generate,
  asyncHandler(validateCredits),
  asyncHandler(validatePlanExpiry),
  asyncHandler(JobCardController.generateJobCard)
);

router.get(
  apiRoutes.jobCard.getNumber,
  asyncHandler(JobCardController.getJobCardNumber)
);

router.post(
  apiRoutes.jobCard.aiFill,
  asyncHandler(validatePlanExpiry),
  asyncHandler(validateCredits),
  asyncHandler(JobCardController.aiFillJobCard)
);

export { router };
