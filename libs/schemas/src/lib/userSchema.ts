import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  orgName: z.string().min(1, 'Organization name is required'),
});

export const loginSchema = userSchema.omit({
  name: true,
  orgName: true,
});

export const signupSchema = userSchema.omit({
  name: true,
});
