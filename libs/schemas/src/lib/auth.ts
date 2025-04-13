import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  organization: z.string(),
});

export type authSchema =
  | z.infer<typeof loginSchema>
  | z.infer<typeof signupSchema>;
