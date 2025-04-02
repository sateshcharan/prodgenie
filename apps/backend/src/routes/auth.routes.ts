import express, { Router } from 'express';
import { login, signup } from '../controllers/auth.controller';
import passport from '../middlewares/passport.middleware';

const router: Router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({ success: true, user: req.user });
  }
);

export default router;
