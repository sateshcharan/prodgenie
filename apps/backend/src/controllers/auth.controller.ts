import passport from 'passport';
import { Request, Response } from 'express';

import { AuthService } from '../services/auth.service';

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const user = await AuthService.signupUser(req.body);
      res.status(201).json({ success: true, user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
  static async login(req: Request, res: Response) {
    passport.authenticate(
      'local',
      { session: false },
      (err: any, user: any, info: any) => {
        if (err || !user) {
          return res.status(401).json({
            success: false,
            message: info?.message || 'Authentication failed',
          });
        }
        const token = AuthService.generateToken(user);
        return res.json({ success: true, token });
      }
    )(req, res);
  }
}
