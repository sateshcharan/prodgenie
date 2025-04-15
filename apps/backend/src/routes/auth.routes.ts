import express, { Router } from 'express';
import { login, signup } from '../controllers/auth.controller';
import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.post(apiRoutes.signup.url, signup);
router.post(apiRoutes.login.url, login);

export default router;
