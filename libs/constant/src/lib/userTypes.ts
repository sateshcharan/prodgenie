export const UserType = {
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];
