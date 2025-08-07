import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { FolderService } from './folder.service.js';

import { prisma } from '@prodgenie/libs/prisma';
import { signupSchema } from '@prodgenie/libs/schema';

// import { supabase } from '@prodgenie/libs/supabase';
import {createClient} from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SECRET_KEY = process.env.JWT_SECRET_BCRYPT;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);

const folderService = new FolderService();

if (!SECRET_KEY) {
  throw new Error('JWT_SECRET_BCRYPT is not defined in environment variables');
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
  }: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    orgId: string;
  }) {
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
  }: {
    email: string;
    password: string;
    name: string;
    inviteCode: string;
  }) {
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

    // Token from Supabase session (optional: use your own JWT here)
    const token = data.session?.access_token;

    if (!token) {
      throw new Error('Token not received from Supabase');
    }

    return token;
  }
}
