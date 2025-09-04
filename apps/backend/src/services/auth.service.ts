import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { FolderService } from './folder.service.js';

import { prisma } from '@prodgenie/libs/prisma';
import { supabase } from '@prodgenie/libs/supabase';
// import { createClient } from '@supabase/supabase-js';
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';
import { signupSchema } from '@prodgenie/libs/schema';

const folderService = new FolderService();

const SECRET_KEY = process.env.JWT_SECRET_BCRYPT;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);

if (!SECRET_KEY) {
  throw new Error('JWT_SECRET_BCRYPT is not defined in environment variables');
}
if (!ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD is not defined in environment variables');
}

interface SignupOwnerPayload {
  name: string;
  email: string;
  password: string;
}

export class AuthService {
  static async signupEmail({ name, email, password }: SignupOwnerPayload) {
    // Sign up user in Supabase
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

    // Scaffold storage folders
    await folderService.scaffoldFolder(name, 'free');
    // // Create or upsert Workspace
    // const workspace = await prisma.workspace.upsert({
    //   where: { name: name },
    //   update: {},
    //   create: { name: name },
    // });

    let workspace = await prisma.workspace.findFirst({
      where: { name: name },
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: name },
      });
    }

    // Store user metadata in your DB
    await prisma.user.create({
      data: {
        id: supabaseUserId, // Use Supabase UID
        email,
        name,
      },
    });

    // Store user metadata in your DB
    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: supabaseUserId,
        role: 'OWNER',
      },
    });

    // sync user confirmation status
    // await this.acceptPendingInvites(supabaseUserId, email);

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
        redirectTo: `${process.env.BACKEND_URL}/auth/callback`,
      },
    });

    if (error) throw new Error(error.message);
    return data;
  }

  static async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
    return data;
  }

  static async oAuthCallback(req: Request, res: Response) {
    const code = req.query.code as string;
    if (!code) return res.status(400).send('Missing code');

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return res.status(401).json({ error: error.message });

    const { session } = data;
    if (!session) return res.status(401).send('No session');

    // set cookie (same as email login)
    res.cookie('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    });

    // optional: refresh token cookie
    res.cookie('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
    });

    // sync user confirmation status
    if (data.user) {
      const supabaseUser = data.user;

      // Ensure in your User table
      let user = await prisma.user.upsert({
        where: { id: supabaseUser.id },
        update: {
          email: supabaseUser.email!,
          name:
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.user_metadata?.name ||
            '',
        },
        create: {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name:
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.user_metadata?.name ||
            '',
        },
      });

      // Step 3: Accept invites
      if (supabaseUser.email) {
        // await this.acceptPendingInvites(supabaseUser.id, supabaseUser.email);
      }
    }

    // redirect frontend
    res.redirect('http://localhost:4200/dashboard');
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
