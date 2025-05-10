import express, { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router: Router = express.Router();

router.post('/signup/owner', AuthController.signupOwner);
router.post('/signup/invite', AuthController.signupWithInvite);
router.post('/invite/generate', AuthController.generateInviteCode); //admin only route
router.post('/login', AuthController.login);

export { router };
