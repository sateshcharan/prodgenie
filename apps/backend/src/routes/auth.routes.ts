import express, { Router } from 'express';

import { AuthController } from '../controllers/index';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.post(apiRoutes.auth.signup.owner, AuthController.signupOwner);
router.post(apiRoutes.auth.signup.invite, AuthController.signupWithInvite);
router.post(apiRoutes.auth.login, AuthController.login);
router.post(apiRoutes.auth.invite.generate, AuthController.generateInviteCode); //admin only route

export { router };
