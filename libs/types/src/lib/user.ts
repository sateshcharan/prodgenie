import { UserType } from '@prisma/client';

export type User = {
  name: string;
  email: string;
  password: string;
  type: UserType;
  organizationId?: string | null;
};
