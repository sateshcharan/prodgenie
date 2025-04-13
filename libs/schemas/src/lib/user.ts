import { z } from 'zod';
import { UserTypeEnum } from './enums.js';

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  type: UserTypeEnum,
  organizationId: z.string().uuid().nullable().optional(),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
