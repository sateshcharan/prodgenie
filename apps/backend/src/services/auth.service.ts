import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '@prodgenie/libs/prisma';
import { signupSchema } from '@prodgenie/libs/schema';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);

export class AuthService {
  static async signupUser({ email, password, orgName }: any) {
    const parseResult = await signupSchema.parseAsync({
      email,
      password,
      orgName,
    });
    console.log(email, password, orgName, parseResult);
    // const hashedPassword = await bcrypt.hash(password, saltRounds);
    // return prisma.user.create({
    //   data: {
    //     name,
    //     email,
    //     password: hashedPassword,
    //     type,
    //     organizationId: orgId ?? null,
    //   },
    // });
  }

  static generateToken(payload: { id: string; email: string }) {
    return jwt.sign(payload, SECRET_KEY, {
      expiresIn: '1h',
    });
  }
}
