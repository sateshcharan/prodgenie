import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// import { createClient } from '@supabase/supabase-js';

import { prisma } from '@prodgenie/libs/db';
import { supabase } from '@prodgenie/libs/supabase';
import { signupSchema } from '@prodgenie/libs/schema';
import { StringService } from '@prodgenie/libs/shared-utils';

import { FolderService } from './folder.service.js';

const folderService = new FolderService();
const stringService = new StringService();

const SECRET_KEY = process.env.JWT_SECRET_BCRYPT || "Smar49atck@123";

const isProd = process.env.NODE_ENV === 'production';

if (!SECRET_KEY) {
  throw new Error('JWT_SECRET_BCRYPT is not defined in environment variables');
}

interface SignupOwnerPayload {
  name: string;
  email: string;
  password: string;
}

export class AuthService {
  private static async setupNewUser(
    supabaseUserId: string,
    email: string,
    name: string
  ) {
    // Confirm pending invites (optional)
    // await this.acceptPendingInvites(supabaseUserId, email);

    if (!name) name = stringService.camelCase(email.split('@')[0]);

    // Create or update user in DB
    await prisma.user.upsert({
      where: { id: supabaseUserId },
      update: { email, name },
      create: { id: supabaseUserId, email, name },
    });

    // Find or create workspace
    let workspace = await prisma.workspace.findFirst({ where: { name } });
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name,
          planId: 'free',
          // credits: prisma.plan.findUnique({ where: { id: 'free' } }).credits,
        },
      });
    }

    // Add user as workspace member
    await prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: supabaseUserId,
          workspaceId: workspace.id,
        },
      },
      update: { role: 'OWNER' },
      create: {
        userId: supabaseUserId,
        workspaceId: workspace.id,
        role: 'OWNER',
      },
    });

    // Scaffold storage folders
    await folderService.scaffoldFolder(name, 'free');
  }

  static async signupEmail({ name, email, password }: SignupOwnerPayload) {
    // Sign up user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          type: 'OWNER',
        },
      },
    });
    if (error) throw new Error(error.message);

    const supabaseUserId = data.user?.id;
    if (!supabaseUserId) throw new Error('User ID not returned');

    await this.setupNewUser(supabaseUserId, email, name);

    return { user: data.user, session: data.session };
  }

  static async loginEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || 'Invalid email or password');
    }

    // supabase auth session
    if (!data.session) throw new Error('No session returned from Supabase');

    // sync user confirmation status
    const supabaseUserId = data.user?.id;
    if (supabaseUserId && data.user?.email) {
      await prisma.user.upsert({
        where: { id: supabaseUserId },
        update: { email: data.user.email, name: data.user.user_metadata?.name },
        create: {
          id: supabaseUserId,
          email: data.user.email,
          name: data.user.user_metadata?.name || '',
        },
      });

      // await this.acceptPendingInvites(supabaseUserId, data.user.email);
    }

    return data.session; // contains access_token + refresh_token
  }

  static async continueWithProvider(provider: string) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google',
      options: {
        redirectTo: `${process.env.API_URL}/api/callback/OAuth`,
      },
    });

    if (error) throw new Error(error.message);
    return data;
  }

  static async resetPassword(email: string) {
    // Step 1: Find the user by email in Supabase
    const {
      data: { users },
      error: fetchError,
    } = await supabase.auth.admin.listUsers();

    if (fetchError) throw new Error(fetchError.message);

    const user = users.find((u) => u.email === email);
    if (!user) throw new Error('No account found with this email.');

    // Step 2: Check the provider(s)
    const provider =
      user.app_metadata?.provider || user.identities?.[0]?.provider;

    if (provider && provider !== 'email') {
      throw new Error(
        `This account uses ${provider} for login. Password reset isn't required. Please sign in using ${provider}.`
      );
    }

    // Step 3: Send reset link (only for email/password users)
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);

    return { message: 'Password reset link sent successfully.', data };
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

  static async oAuthCallback(req: Request, res: Response) {
    const next = req.query.next as string;
    const code = req.query.code as string;
    if (!code) return res.status(400).send('Missing code');

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
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

    // if (data.user) {
    //   const supabaseUser = data.user;

    //   await this.setupNewUser(
    //     supabaseUser.id,
    //     supabaseUser.email,
    //     supabaseUser.name
    //   );
    // }

    // redirect frontend
    res.redirect('http://localhost:4200/dashboard');
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
}
