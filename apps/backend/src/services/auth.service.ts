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
  confirmPassword: string;
  orgName: string;
}

interface SignupInvitePayload {
  email: string;
  password: string;
  name: string;
  inviteCode: string;
}

export class AuthService {
  // custom auth
  // for owner
  // static async signupOwner({
  //   name,
  //   email,
  //   password,
  //   confirmPassword,
  //   orgName,
  // }: SignupOwnerPayload) {
  //   const result = signupSchema.safeParse({
  //     name,
  //     email,
  //     password,
  //     confirmPassword,
  //     orgName,
  //   });
  //   if (!result.success) {
  //     const formatted = result.error.issues.map((i) => i.message).join(', ');
  //     throw new Error(`Validation failed: ${formatted}`);
  //   }
  //   const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  //   // Scaffold storage folder for the new organization
  //   await folderService.scaffoldFolder(orgName);
  //   // Create org if not exists (optional safety)
  //   const org = await prisma.org.upsert({
  //     where: { name: orgName },
  //     update: {},
  //     create: { name: orgName },
  //   });
  //   // Create user with org association
  //   const user = await prisma.user.create({
  //     data: {
  //       email,
  //       password: hashedPassword,
  //       name,
  //       type: 'OWNER',
  //       orgId: org.id,
  //     },
  //   });
  //   //create admin user
  //   const adminUser = await prisma.user.create({
  //     data: {
  //       email: `admin@${orgName}.com`,
  //       password: await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS),
  //       name: 'admin',
  //       type: 'ADMIN',
  //       orgId: org.id,
  //     },
  //   });
  //   return user;
  // }
  // // for member
  // static async signupWithInvite({
  //   email,
  //   password,
  //   name,
  //   inviteCode,
  // }: SignupInvitePayload) {
  //   const invite = await prisma.inviteCode.findUnique({
  //     where: { code: inviteCode },
  //     include: { org: true },
  //   });
  //   if (!invite || (invite.expiresAt && new Date() > invite.expiresAt)) {
  //     throw new Error('Invalid or expired invite code');
  //   }
  //   const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  //   const user = await prisma.user.create({
  //     data: {
  //       email,
  //       password: hashedPassword,
  //       name,
  //       type: 'MEMBER',
  //       orgId: invite.orgId,
  //     },
  //   });
  //   await prisma.inviteCode.update({
  //     where: { code: inviteCode },
  //     data: { usedBy: user.id },
  //   });
  //   return user;
  // }
  // static generateToken(payload: { id: string; email: string }): string {
  //   return jwt.sign(payload, SECRET_KEY, {
  //     expiresIn: '1h',
  //   });
  // }
  // static async generateInviteCode(orgId: string, expiresInHours = 24) {
  //   const code = crypto.randomUUID().slice(0, 8); // simple 8-char code
  //   const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  //   return prisma.inviteCode.create({
  //     data: {
  //       code,
  //       orgId,
  //       expiresAt,
  //     },
  //   });
  // }

  // supabase auth
  static async signupOwner({
    name,
    email,
    password,
    confirmPassword,
    orgName,
  }: SignupOwnerPayload) {
    // Sign up user in Supabase
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        type: 'OWNER',
      },
    });
    if (error) throw new Error(error.message);
    const supabaseUserId = data.user?.id;
    if (!supabaseUserId) throw new Error('User ID not returned');
    // Scaffold storage folders
    await folderService.scaffoldFolder(orgName);
    // Create or upsert Org
    const org = await prisma.org.upsert({
      where: { name: orgName },
      update: {},
      create: { name: orgName },
    });
    // Store user metadata in your DB
    await prisma.user.create({
      data: {
        id: supabaseUserId, // Use Supabase UID
        email,
        name,
        type: 'OWNER',
        orgId: org.id,
      },
    });
    // Optionally create an admin user (for internal use only)
    await prisma.user.create({
      data: {
        email: `admin@${orgName}.com`,
        password: await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS),
        name: 'admin',
        type: 'ADMIN',
        orgId: org.id,
      },
    });
    return data.user;
  }
  static async signupWithInvite({
    email,
    password,
    name,
    inviteCode,
  }: SignupInvitePayload) {
    const invite = await prisma.inviteCode.findUnique({
      where: { code: inviteCode },
      include: { org: true },
    });
    if (!invite || (invite.expiresAt && new Date() > invite.expiresAt)) {
      throw new Error('Invalid or expired invite code');
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        type: 'MEMBER',
      },
    });
    if (error) throw new Error(error.message);
    const supabaseUserId = data.user?.id;
    if (!supabaseUserId) throw new Error('No user ID returned');
    await prisma.user.create({
      data: {
        id: supabaseUserId,
        email,
        name,
        type: 'MEMBER',
        orgId: invite.orgId,
      },
    });
    await prisma.inviteCode.update({
      where: { code: inviteCode },
      data: { usedBy: supabaseUserId },
    });
    return data.user;
  }

  static async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || 'Invalid email or password');
    }

    const token = data.session?.access_token;
    if (!token) {
      throw new Error('Token not received from Supabase');
    }

    return token;
  }

  // supabase = createClient(
  //   process.env.SUPABASE_URL!,
  //   process.env.SUPABASE_ANON_KEY!,
  //   {
  //     auth: {
  //       detectSessionInUrl: true,
  //       flowType: 'pkce',
  //       storage: {
  //         getItem: () => Promise.resolve('FETCHED_TOKEN'),
  //         setItem: () => {},
  //         removeItem: () => {},
  //       },
  //     },
  //   }
  // );

  static async oAuthLogin(provider: string) {
    console.log(provider);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: `${process.env.BACKEND_URL}/auth/callback`,
      },
    });
    if (error) throw new Error(error.message);
    return data;
  }

  static async oAuthCallback(req: Request, res: Response) {
    const code = req.query.code;
    const next = req.query.next ?? '/';

    if (code) {
      const supabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return parseCookieHeader(req.headers.cookie ?? '');
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                res.appendHeader(
                  'Set-Cookie',
                  serializeCookieHeader(name, value, options)
                )
              );
            },
          },
        }
      );

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        throw new Error(`OAuth callback error: ${error.message}`);
      }

      // Optional: Store user data in your database if needed
      if (data.user) {
        const supabaseUser = data.user;

        // Check if user exists in your database
        let user = await prisma.user.findUnique({
          where: { id: supabaseUser.id },
        });

        // Create user if doesn't exist
        if (!user && supabaseUser.email) {
          user = await prisma.user.create({
            data: {
              id: supabaseUser.id,
              email: supabaseUser.email,
              name:
                supabaseUser.user_metadata?.full_name ||
                supabaseUser.user_metadata?.name ||
                '',
              type: supabaseUser.user_metadata?.type || 'MEMBER',
              // Note: You might need to handle orgId assignment for OAuth users
            },
          });
        }
      }
    }

    return { url: `/${next.slice(1)}` };
  }
}
