import express, { Router } from 'express';

import { asyncHandler } from '../middlewares/index.js';
import { BatchedController } from '../controllers/batched.controller.js';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.get(apiRoutes.batched.init, asyncHandler(BatchedController.init));
router.get(
  apiRoutes.batched.workspaceChange,
  asyncHandler(BatchedController.workspaceChange)
);

export { router };
