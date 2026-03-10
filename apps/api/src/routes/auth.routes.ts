import express, { Router } from 'express';

import { apiRoutes } from '@prodgenie/libs/constant';

import { AuthController } from '../controllers/auth.controller';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';

const router: Router = express.Router();

router.post(
  apiRoutes.auth.signup.email,
  asyncHandler(AuthController.signupEmail)
);

router.post(
  apiRoutes.auth.login.email,
  asyncHandler(AuthController.loginEmail)
);

router.get(
  apiRoutes.auth.continueWithProvider(':provider'),
  asyncHandler(AuthController.continueWithProvider)
);

router.post(apiRoutes.auth.logout, asyncHandler(AuthController.logout));

router.post(
  apiRoutes.auth.resetPassword,
  asyncHandler(AuthController.resetPassword)
);

router.post(
  apiRoutes.auth.updatePassword,
  asyncHandler(AuthController.updatePassword)
);

router.post(
  apiRoutes.auth.resetPasswordCallback,
  asyncHandler(AuthController.resetPasswordCallback)
);

export { router };
