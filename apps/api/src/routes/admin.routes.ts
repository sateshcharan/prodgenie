import express, { Router } from 'express';

import { apiRoutes } from '@prodgenie/libs/constant';

import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { AdminController } from '../controllers/admin.controller';
import { requireRole } from '../middlewares/user.middleware';

const router: Router = express.Router();

router.get(
  `${apiRoutes.admin.getEventDetails}/:eventId`,
  asyncHandler(AdminController.getEventDetails)
);

router.post(
  apiRoutes.admin.approveEvent,
  requireRole('admin'),
  asyncHandler(AdminController.approveEvent)
);

router.post(
  apiRoutes.admin.rejectEvent,
  requireRole('admin'),
  asyncHandler(AdminController.rejectEvent)
);

export { router };
