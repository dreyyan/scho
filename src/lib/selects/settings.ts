import { Prisma } from '@/generated/prisma/client';

/**
 * Represents the fields returned to the client for a user's account information.
 */
const ACCOUNT_INFORMATION_SELECT = {
  id: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect;

export { ACCOUNT_INFORMATION_SELECT };
