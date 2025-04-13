import { z } from 'zod';

export const UserTypeEnum = z.enum(['ADMIN', 'OWNER', 'USER']);
export const FileTypeEnum = z.enum([
  'DRAWING',
  'TEMPLATE',
  'SEQUENCE',
  'JOB_CARD',
]);
