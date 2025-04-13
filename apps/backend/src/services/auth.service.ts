import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
const saltRounds = process.env.SALT_ROUNDS || 10;

export const registerUser = async ({
  email,
  password,
  organization,
}: {
  email: string;
  password: string;
  organization: string;
}) => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log(email, password, organization);
  return prisma.user.create({
    data: { email, password: hashedPassword, organization },
  });
};

export const generateToken = (user: { id: string; email: string }) => {
  return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: '1h',
  });
};
