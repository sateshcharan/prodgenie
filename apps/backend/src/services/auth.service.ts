import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '@prodgenie/libs/prisma';
import { signupSchema } from '@prodgenie/libs/schema';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);

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
    // Check if organization exists, if not create it
    const org = await prisma.org.upsert({
      where: { name: orgName },
      update: {}, // No updates, just check existence
      create: { name: orgName },
    });

    // Create the user and associate the org
    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: orgName,
        type: 'ADMIN',
        orgId: org.id,
      },
    });
  }

  static generateToken(payload: { id: string; email: string }) {
    return jwt.sign(payload, SECRET_KEY, {
      expiresIn: '1h',
    });
  }
}
