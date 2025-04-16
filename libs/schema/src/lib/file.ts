import { z } from 'zod';
import { FileType } from '@prisma/client';

export const FileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  path: z.string(),
  type: z.nativeEnum(FileType),
  userId: z.string().uuid(),
  createdAt: z.date(),
});

export type FileSchema = z.infer<typeof FileSchema>;
