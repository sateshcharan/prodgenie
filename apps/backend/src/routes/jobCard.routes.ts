import express, { Router } from 'express';

import { JobCardController } from '../controllers/jobCard.controller.js';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.post(apiRoutes.jobCard.generate, JobCardController.generateJobCard);

export { router };
