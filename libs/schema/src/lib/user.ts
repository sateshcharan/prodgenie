import { z } from 'zod';
import { UserType } from '@prisma/client';

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  type: z.nativeEnum(UserType),
  organizationId: z.string().uuid().nullable().optional(),
  createdAt: z.date(),
});

export type UserSchema = z.infer<typeof UserSchema>;
