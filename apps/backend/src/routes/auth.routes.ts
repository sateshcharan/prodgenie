import express, { Router } from 'express';

import { AuthController } from '../controllers/index';
import { asyncHandler } from '../middlewares/index';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.post(apiRoutes.auth.login, asyncHandler(AuthController.login));
router.post(
  apiRoutes.auth.signup.owner,
  asyncHandler(AuthController.signupOwner)
);
router.post(
  apiRoutes.auth.signup.invite,
  asyncHandler(AuthController.signupWithInvite)
);
router.post(
  apiRoutes.auth.invite.generate,
  asyncHandler(AuthController.generateInviteCode)
); //admin only route

export { router };
