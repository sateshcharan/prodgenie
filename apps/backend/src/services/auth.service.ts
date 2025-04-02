import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export const registerUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { email, password: hashedPassword } });
};

export const generateToken = (user: { id: string; email: string }) => {
  return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: '1h',
  });
};
