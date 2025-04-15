import { z } from 'zod';
import { FileTypeEnum } from './enums.js';

export const FileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  path: z.string(),
  type: FileTypeEnum,
  userId: z.string().uuid(),
  createdAt: z.date(),
});

export type FileSchema = z.infer<typeof FileSchema>;
