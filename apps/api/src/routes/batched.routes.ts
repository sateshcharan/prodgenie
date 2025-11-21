import express, { Router } from 'express';

import { asyncHandler } from '../middlewares/index.js';

import { apiRoutes } from '@prodgenie/libs/constant';
import { BatchedController } from '../controllers/batched.controller.js';

const router: Router = express.Router();

router.get(apiRoutes.batched.init, asyncHandler(BatchedController.init));

export { router };
