import { Request, Response } from 'express';
import passport from 'passport';
import { registerUser, generateToken } from '../services/auth.service';

export const signup = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ success: true, user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = (req: Request, res: Response, next: any) => {
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

      const token = generateToken(user);
      return res.json({ success: true, token });
    }
  )(req, res, next);
};
