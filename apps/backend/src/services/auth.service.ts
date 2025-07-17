import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { FolderService } from './folder.service.js';

import { prisma } from '@prodgenie/libs/prisma';
import { signupSchema } from '@prodgenie/libs/schema';

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
  /**
   * Signup a user and create a new organization (Owner/ADMIN)
   */
  static async signupOwner({
    name,
    email,
    password,
    confirmPassword,
    orgName,
  }: SignupOwnerPayload) {
    const result = signupSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      orgName,
    });

    if (!result.success) {
      const formatted = result.error.issues.map((i) => i.message).join(', ');
      throw new Error(`Validation failed: ${formatted}`);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Scaffold storage folder for the new organization
    await folderService.scaffoldFolder(orgName);

    // Create org if not exists (optional safety)
    const org = await prisma.org.upsert({
      where: { name: orgName },
      update: {},
      create: { name: orgName },
    });

    // Create user with org association
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        type: 'OWNER',
        orgId: org.id,
      },
    });

    //create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: `admin@${orgName}.com`,
        password: await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS),
        name: 'admin',
        type: 'ADMIN',
        orgId: org.id,
      },
    });

    return user;
  }

  /**
   * Signup using invite code (Member)
   */
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

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        type: 'MEMBER',
        orgId: invite.orgId,
      },
    });

    await prisma.inviteCode.update({
      where: { code: inviteCode },
      data: { usedBy: user.id },
    });

    return user;
  }

  /**
   * Generate JWT for authentication
   */
  static generateToken(payload: { id: string; email: string }): string {
    return jwt.sign(payload, SECRET_KEY, {
      expiresIn: '1h',
    });
  }

  /**
   * Generate a short-lived invite code for an org
   */
  static async generateInviteCode(orgId: string, expiresInHours = 24) {
    const code = crypto.randomUUID().slice(0, 8); // simple 8-char code

    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    return prisma.inviteCode.create({
      data: {
        code,
        orgId,
        expiresAt,
      },
    });
  }
}
