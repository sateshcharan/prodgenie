import passport from 'passport';
import { Request, Response } from 'express';

import { AuthService } from '../services/index.js';

export class AuthController {
  static async signupOwner(req: Request, res: Response) {
    const { email, password, confirmPassword, orgId } = req.body;
    const user = await AuthService.signupOwner({
      email,
      password,
      confirmPassword,
      orgId,
      name: email.split('@')[0],
    });
    const token = AuthService.generateToken({
      id: user.id,
      email: user.email,
    });
    res.status(201).json({ user, token });
  }

  static async signupWithInvite(req: Request, res: Response) {
    const { email, password, name, inviteCode } = req.body;
    const user = await AuthService.signupWithInvite({
      email,
      password,
      name,
      inviteCode,
    });
    const token = AuthService.generateToken({
      id: user.id,
      email: user.email,
    });
    res.status(201).json({ user, token });
  }

  static async generateInviteCode(req: Request, res: Response) {
    const { orgId, expiresInHours } = req.body;
    const invite = await AuthService.generateInviteCode(orgId, expiresInHours);
    res.status(201).json({ invite });
  }

  static async login(req: Request, res: Response) {
    // passport.authenticate(
    //   'local',
    //   { session: false },
    //   (err: any, user: any, info: any) => {
    //     if (err || !user) {
    //       return res.status(401).json({
    //         success: false,
    //         message: info?.message || 'Authentication failed',
    //       });
    //     }
    //     const token = AuthService.generateToken(user);
    //     return res.json({ success: true, token });
    //   }
    // )(req, res);
    try {
      const { email, password } = req.body;
      const token = await AuthService.login(email, password);
      res.status(200).json({ success: true, token });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: err.message || 'Authentication failed',
      });
    }
  }

  static async oAuthLogin(req: Request, res: Response) {
    const { provider } = req.params;
    const data = await AuthService.oAuthLogin(provider);
    res.redirect(data.url);
  }

  static async oAuthCallback(req: Request, res: Response) {
    const { url } = await AuthService.oAuthCallback(req, res);
    res.redirect(url);
  }
}
