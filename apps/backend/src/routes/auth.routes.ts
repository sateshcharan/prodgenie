import express, { Router } from 'express';
import { apiRoutes } from '@prodgenie/libs/constant';
import { AuthController } from '../controllers/auth.controller';

const router: Router = express.Router();

router.post(apiRoutes.signup.url, AuthController.signup);
router.post(apiRoutes.login.url, AuthController.login);

export default router;
