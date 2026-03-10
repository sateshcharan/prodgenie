import express, { Router } from 'express';

import { NotificationController } from '../controllers/notification.controller';
import { authenticateSupabaseJWT } from '../middlewares/supabase.middleware';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';

const router: Router = express.Router();

router.get(
  '/getUserNotifications',
  authenticateSupabaseJWT,
  asyncHandler(NotificationController.getUserNotifications)
);

router.patch(
  '/notifications/:id/read',
  authenticateSupabaseJWT,
  asyncHandler(NotificationController.markAsRead)
);

// router.post(
//   '/workspace/:workspaceId/accept-invite',
//   authenticateSupabaseJWT,
//   asyncHandler(NotificationController.acceptInvite)
// );

// router.post(
//   '/workspace/:workspaceId/reject-invite',
//   authenticateSupabaseJWT,
//   asyncHandler(NotificationController.rejectInvite)
// );

export { router };
