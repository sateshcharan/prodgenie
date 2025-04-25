import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '@prodgenie/libs/prisma';
import { signupSchema } from '@prodgenie/libs/schema';
import { FolderService } from './folder.service';

const SECRET_KEY = process.env.JWT_SECRET_BCRYPT || 'your_secret_key';
const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
const folderService = new FolderService();

export class AuthService {
  static async signupUser({ email, password, orgName }: any) {
    const parseResult = signupSchema.safeParse({
      email,
      password,
      orgName,
    });

    if (!parseResult.success) {
      throw new Error(parseResult.error.message);
    }

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
        type: 'ADMIN',
        orgId: org?.id,
      },
    });
  }

  static generateToken(payload: { id: string; email: string }) {
    return jwt.sign(payload, SECRET_KEY, {
      expiresIn: '1h',
    });
  }
}
