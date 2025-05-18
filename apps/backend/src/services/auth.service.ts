import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { prisma } from '@prodgenie/libs/prisma';
import { signupSchema } from '@prodgenie/libs/schema';
import { FolderService } from './folder.service.js';

const SECRET_KEY = process.env.JWT_SECRET_BCRYPT;
const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
const folderService = new FolderService();

export class AuthService {
  /**
   * Signup a user and create a new organization (Owner/ADMIN)
   */
  static async signupOwner({ email, password, orgName }: any) {
    const parseResult = signupSchema.safeParse({
      email,
      password,
      orgName,
    });
    if (!parseResult.success) throw new Error(parseResult.error.message);

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Scaffold folders for the organization
    await folderService.scaffoldFolder(orgName);

    const org = await prisma.org.findUnique({
      where: { name: orgName },
    });

    // Create the user and associate the org
    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: orgName,
        type: 'OWNER',
        orgId: org.id,
      },
    });
  }

  /**
   * Signup a user using an invite code (Member)
   */
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

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        type: 'MEMBER',
        orgId: invite.orgId,
      },
    });

    // Optionally mark invite as used (optional)
    await prisma.inviteCode.update({
      where: { code: inviteCode },
      data: { usedBy: user.id },
    });

    return user;
  }

  /**
   * Generate a JWT token
   */
  static generateToken(payload: { id: string; email: string }) {
    return jwt.sign(payload, SECRET_KEY, {
      expiresIn: '1h',
    });
  }

  /**
   * Generate a unique invite code for an org
   */
  static async generateInviteCode(orgId: string, expiresInHours = 24) {
    const code = crypto.randomUUID().slice(0, 8);

    return prisma.inviteCode.create({
      data: {
        code,
        orgId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * expiresInHours),
      },
    });
  }
}
