import express, { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router: Router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);

export default router;
