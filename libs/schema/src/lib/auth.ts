import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  orgaName: z.string(),
});

export type loginSchema = z.infer<typeof loginSchema>;
export type signupSchema = z.infer<typeof signupSchema>;
