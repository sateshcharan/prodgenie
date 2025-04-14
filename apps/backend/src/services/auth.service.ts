import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@prodgenie/libs/prisma';
import { User } from '@prodgenie/libs/types';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
const saltRounds = process.env.SALT_ROUNDS || 10;

export const registerUser = async ({
  name,
  email,
  password,
  type,
  organizationId,
}: User) => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log(hashedPassword);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      type,
      organizationId: organizationId ?? null,
    },
  });
};

export const generateToken = (user: { id: string; email: string }) => {
  return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: '1h',
  });
};
