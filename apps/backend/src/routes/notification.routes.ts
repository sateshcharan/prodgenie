import express, { Router } from 'express';

import { apiRoutes } from '@prodgenie/libs/constant';

import { NotificationController } from '../controllers';
import { authenticateSupabaseJWT, asyncHandler } from '../middlewares';

const router: Router = express.Router();

router.get(
  apiRoutes.notification.getUserNotifications,
  authenticateSupabaseJWT,
  asyncHandler(NotificationController.getUserNotifications)
);

router.patch(
  '/notifications/:id/read',
  authenticateSupabaseJWT,
  asyncHandler(NotificationController.markAsRead)
);

router.post(
  '/workspace/:workspaceId/accept-invite',
  authenticateSupabaseJWT,
  asyncHandler(NotificationController.acceptInvite)
);

router.post(
  '/workspace/:workspaceId/reject-invite',
  authenticateSupabaseJWT,
  asyncHandler(NotificationController.rejectInvite)
);

export { router };
