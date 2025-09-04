import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  // confirmPassword: z.string().min(6),
  // orgName: z.string().min(16),
  // inviteCode: z.string().optional(),
});
// .refine((data) => data.password === data.confirmPassword, {
//   path: ['confirmPassword'], // Show error under this field
//   message: 'Passwords do not match',
// });

export type loginSchema = z.infer<typeof loginSchema>;
export type signupSchema = z.infer<typeof signupSchema>;
