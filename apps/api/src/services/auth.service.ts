import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// import { createClient } from '@supabase/supabase-js';
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';

import { prisma } from '@prodgenie/libs/db';
import { signupSchema } from '@prodgenie/libs/schema';
import { StringService } from '@prodgenie/libs/shared-utils';
import {
  supabase,
  supabaseAdmin,
  FolderService,
} from '@prodgenie/libs/supabase';
import { CustomError } from '@prodgenie/libs/server-services/lib/error.service.js';

import { WorkspaceService } from './workspace.service.js';
import { UserService } from './user.service.js';
import { apiRoutes } from '@prodgenie/libs/constant';

const isProd = process.env.NODE_ENV === 'production';
// const SECRET_KEY = process.env.JWT_SECRET_BCRYPT ;

// if (!SECRET_KEY) {
//   throw new Error('JWT_SECRET_BCRYPT is not defined in environment variables');
// }

export class AuthService {
  static async signupEmail({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password?: string;
  }) {
    if (!email || !password) throw new Error('Email and password is required');

    // const existingUser = await prisma.user.findUnique({
    //   where: { email },
    // });
    // if (existingUser)
    //   throw new CustomError(
    //     'user with this email already exists try logging in',
    //     409
    //   );

    // Sign up user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          type: 'owner',
          provider: 'email',
        },
      },
    });
    if (error) throw new Error(error.message);

    const supabaseUser = data.user;
    if (!supabaseUser?.id) throw new Error('User ID not returned');

    // Setup new user and workspace after sign up
    try {
      await prisma.$transaction(async (tx) => {
        const workspace = await UserService.setupNewUserTx(
          tx,
          supabaseUser.id,
          email,
          name
        );
        await FolderService.scaffoldFolder(workspace.id);
      });
    } catch (err: any) {
      await supabaseAdmin.auth.admin.deleteUser(supabaseUser.id);
      throw new Error(err);
    }

    return { user: data.user, session: data.session ?? null };
  }

  static async loginEmail(email: string, password: string) {
    if (!email || !password) throw new Error('Email and password is required');

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser)
      throw new CustomError('No user found with this email', 404);

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error?.code === 'invalid_credentials') {
      throw error;
    }

    const { session, user } = data;
    if (!session || !user) throw new Error('Invalid session or user');

    return session;
  }

  static async continueWithProvider(provider: string) {
    const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
      provider: provider as 'google',
      options: {
        redirectTo: `${process.env.VITE_API_URL}${apiRoutes.callback.base}${apiRoutes.callback.OAuth}`,
      },
    });

    // setup new user
    // await this.setupNewUser(data.user.id, data.user.email, data.user.name);

    if (error) throw new Error(error.message);
    return data;
  }

  static async inviteUserViaEmail(email: string) {
    if (!email) throw new Error('Email required');

    // First, check Supabase auth for existing user (listUsers + find)
    const { data: listData, error: listError } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (listError) console.warn('listUsers error', listError);

    const existing = listData?.users?.find(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase()
    );

    // If user exists in Supabase Auth, return the user object (and ensure Prisma row)
    if (existing) {
      await prisma.user.upsert({
        where: { id: existing.id },
        update: { email: existing.email },
        create: {
          id: existing.id,
          email: existing.email,
          name: existing.user_metadata?.name ?? '',
        },
      });

      return existing;
    }

    // Otherwise, send invite (admin.inviteUserByEmail)
    const { data: invited, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.VITE_API_URL}/auth/callback`,
      });

    if (inviteError)
      throw new Error(inviteError.message || 'Failed to invite user');

    // Supabase may or may not return the user id immediately depending on config.
    // invited.user may exist; if not, we rely on later signup to create Prisma row.
    const supaUser = invited?.user ?? null;

    // If Supabase returns user id, create Prisma row now
    if (supaUser?.id) {
      await prisma.user.upsert({
        where: { id: supaUser.id },
        update: { email: supaUser.email ?? email },
        create: {
          id: supaUser.id,
          email: supaUser.email ?? email,
          name: supaUser.user_metadata?.name ?? '',
        },
      });
    } else {
      // Create a placeholder pending invite row in your users table if desired,
      // or create a workspace-invite row - depending on your design.
      // For now we return the invited payload.
    }

    return invited;
  }

  static async resetPassword(email: string) {
    // Use supabase admin to ensure user exists and is email provider
    const { data: listData, error: listError } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (listError) throw new Error(listError.message);

    const user = listData?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (!user) throw new Error('No account found with this email.');

    const provider =
      user.app_metadata?.provider || user.identities?.[0]?.provider;
    if (provider && provider !== 'email') {
      throw new Error(
        `Account uses ${provider} for login. Please sign in using ${provider}.`
      );
    }

    const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(
      email
    );
    if (error) throw new Error(error.message);
    return { message: 'Password reset link sent', data };
  }

  static async updatePassword(password: string, email?: string) {
    // Optional: if you store provider info in your database, use that
    let provider: string | null = null;

    if (email) {
      // Fetch user from Prisma or Supabase
      const user = await prisma.user.findUnique({ where: { email } });

      if (user?.provider && user.provider !== 'email') {
        throw new Error(
          `This account uses ${user.provider} login. Password updates are not allowed.`
        );
      }
    } else {
      // Fallback: use Supabase Admin API to infer provider from active session
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw new Error('Unable to fetch user session.');
      if (!user) throw new Error('User not found.');

      provider = user.app_metadata?.provider || user.identities?.[0]?.provider;

      if (provider && provider !== 'email') {
        throw new Error(
          `This account uses ${provider} login. Password update isn't supported.`
        );
      }
    }

    // Now perform the password update only for email-based users
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw new Error(error.message);
    return { message: 'Password updated successfully.', data };
  }

  static async updatePasswordForUserId(userId: string, newPassword: string) {
    if (!userId) throw new Error('userId required');
    // Use admin API to update password
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        password: newPassword,
      }
    );
    if (error) throw new Error(error.message);
    return data;
  }

  static async OAuthCallback(req: Request, res: Response) {
    const next = req.query.next as string;
    const code = req.query.code as string;
    if (!code) return res.status(400).send('Missing code');

    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(
      code
    );
    if (error) return res.status(401).json({ error: error.message });

    const { session } = data;
    if (!session) return res.status(401).send('No session');

    res.cookie('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: isProd ? true : false,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    });

    res.cookie('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: isProd ? true : false,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
    });

    const supabaseUser = data.user;

    // Setup new user and workspace after sign up if first time login
    const existingUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (!existingUser) {
      try {
        await prisma.$transaction(async (tx) => {
          const workspace = await UserService.setupNewUserTx(
            tx,
            supabaseUser.id,
            supabaseUser.email,
            supabaseUser.user_metadata?.name
          );
          await FolderService.scaffoldFolder(workspace.id);
        });
      } catch (err: any) {
        await supabaseAdmin.auth.admin.deleteUser(supabaseUser.id);
        throw new Error(err);
      }
    }

    res.redirect(process.env.WEB_URL + '/dashboard');
  }

  static async resetPasswordCallback(req, res) {
    const code = req.query.code;
    if (!code) return res.status(400).send('Missing code');

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return res.status(400).json({ error: error.message });

    const { session } = data;
    if (!session) return res.status(400).send('No session');

    res.cookie('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: isProd ? true : false,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    });

    res.cookie('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: isProd ? true : false,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
    });

    res.redirect('http://localhost:3000/set-new-password');
  }

  // == future features ==
  // static async acceptPendingInvites(userId: string, email: string) {
  //   const invites = await prisma.workspaceInvite.findMany({
  //     where: {
  //       email,
  //       acceptedAt: null,
  //       expiresAt: { gt: new Date() }, // not expired
  //     },
  //   });

  //   for (const invite of invites) {
  //     await prisma.workspaceMember.create({
  //       data: {
  //         userId,
  //         workspaceId: invite.workspaceId,
  //         role: invite.role,
  //       },
  //     });

  //     await prisma.workspaceInvite.update({
  //       where: { id: invite.id },
  //       data: { acceptedAt: new Date() },
  //     });
  //   }

  //   return invites;
  // }

  //   static async reactivateAccount(email: string) {
  //   const { error } = await supabaseAdmin.auth.signInWithOtp({
  //     email,
  //     options: {
  //       emailRedirectTo: `${process.env.FRONTEND_URL}/auth/reactivate`,
  //     },
  //   });

  //   if (error) throw error;
  // }
}
