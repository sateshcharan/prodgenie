import { Request, Response } from 'express';

import { AuthService } from '../services/auth.service';

export class AuthController {
  static async signupEmail(req: Request, res: Response) {
    const { name, email, password } = req.body;

    try {
      const { user, session } = await AuthService.signupEmail({
        name: name || email.split('@')[0],
        email,
        password,
      });

      // const token = AuthService.generateToken({
      //   id: user.id,
      //   email: user.email,
      // });

      if (session) {
        res.cookie('sb-access-token', session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });
        res.cookie('sb-refresh-token', session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });
      }
      res.status(201).json({ user, session });
    } catch (error: any) {
      if (error.status === 409) {
        return res.status(409).json({ error: error.message });
      }

      return res.status(400).json({ error: error.message });
    }
  }

  static async loginEmail(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const session = await AuthService.loginEmail(email, password);

      // Set cookies (HttpOnly so frontend JS cannot access them)
      // Set cookies (HttpOnly)
      res.cookie('sb-access-token', session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
      res.cookie('sb-refresh-token', session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });

      return res.status(200).json({ success: true });
    } catch (err: any) {
      if (err.status === 404) {
        return res
          .status(404)
          .json({ success: false, message: 'User not found, please sign up' });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid credentials, please try again',
      });
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

  static async updatePassword(req: Request, res: Response) {
    const { password } = req.body;

    await AuthService.updatePassword(password);
    res.status(200).json({ success: true });
  }

  static async resetPassword(req: Request, res: Response) {
    const { email } = req.body;

    await AuthService.resetPassword(email);
    res.status(200).json({ success: true });
  }

  //helper methods
  static async OAuthCallback(req: Request, res: Response) {
    const { url } = await AuthService.OAuthCallback(req, res);
    return res.redirect(url);
  }

  static async resetPasswordCallback(req: Request, res: Response) {
    const { url } = await AuthService.resetPasswordCallback(req, res);
    return res.redirect(url);
  }

  // === future feature ===
  // static async reactivateAccount(req: Request, res: Response) {
  //   const { email } = req.body;

  //   await AuthService.reactivateAccount(email);
  //   res.status(200).json({ success: true });
  // }
}
