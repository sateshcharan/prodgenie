import { Request, Response } from 'express';

import { AuthService } from '../services/index.js';

export class AuthController {
  static async signupEmail(req: Request, res: Response) {
    const { name, email, password, workspaceId } = req.body;

    const { user, session } = await AuthService.signupEmail({
      name,
      email,
      password,
      workspaceId,
      // name: email.split('@')[0],
    });
    // const token = AuthService.generateToken({
    //   id: user.id,
    //   email: user.email,
    // });
    res.status(201).json({ user, session });
  }

  static async loginEmail(req: Request, res: Response) {
    try {
      //supabase cookie login
      const { email, password } = req.body;
      const session = await AuthService.loginEmail(email, password);

      // Set cookies (HttpOnly so frontend JS cannot access them)
      res.cookie('sb-access-token', session.access_token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production',
        // sameSite: 'lax',
        // maxAge: 1000 * 60 * 60, // 1 hour
        sameSite: 'none',
        secure: true,
      });
      res.cookie('sb-refresh-token', session.refresh_token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production',
        // sameSite: 'lax',
        // maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        sameSite: 'none',
        secure: true,
      });

      res.status(200).json({ success: true });
    } catch (err: any) {
      console.error('Login failed:', err.message);

      if (err.code === 'INVALID_CREDENTIALS') {
        return res.status(401).json({ success: false, message: err.message });
      }

      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  static async continueWithProvider(req: Request, res: Response) {
    const { provider } = req.params;

    const data = await AuthService.continueWithProvider(provider);
    res.redirect(data.url);
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('sb-access-token');
    res.clearCookie('sb-refresh-token');
    res.status(200).json({ success: true });
  }

  static async resetPassword(req: Request, res: Response) {
    const { email } = req.body;

    await AuthService.resetPassword(email);
    res.status(200).json({ success: true });
  }

  static async updatePassword(req: Request, res: Response) {
    const { password } = req.body;

    await AuthService.updatePassword(password);
    res.status(200).json({ success: true });
  }

  //helper methods
  static async oAuthCallback(req: Request, res: Response) {
    const { url } = await AuthService.oAuthCallback(req, res);
    return res.redirect(url);
  }

  static async resetPasswordCallback(req: Request, res: Response) {
    const { url } = await AuthService.resetPasswordCallback(req, res);
    return res.redirect(url);
  }
}
