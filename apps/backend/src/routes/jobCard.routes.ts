import express, { Router } from 'express';

import { JobCardController } from '../controllers/jobCard.controller.js';
import { asyncHandler } from '../middlewares/index.js';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.post(
  apiRoutes.jobCard.generate,
  asyncHandler(JobCardController.generateJobCard)
);
router.get(
  apiRoutes.jobCard.getNumber,
  asyncHandler(JobCardController.getJobCardNumber)
);

export { router };
