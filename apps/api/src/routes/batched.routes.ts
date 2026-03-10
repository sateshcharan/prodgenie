import express, { Router } from 'express';

import { apiRoutes } from '@prodgenie/libs/constant';

import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { BatchedController } from '../controllers/batched.controller.js';

const router: Router = express.Router();

router.get(apiRoutes.batched.init, asyncHandler(BatchedController.init));

router.get(
  apiRoutes.batched.workspaceChange,
  asyncHandler(BatchedController.workspaceChange)
);

export { router };
