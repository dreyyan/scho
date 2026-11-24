import { Prisma } from '@/generated/prisma/client';

/**
 * Represents the fields returned to the client for an inbox item.
 * Shared by every inbox item route for consistent responses.
 */
const INBOX_ITEM_SELECT = {
  id: true,
  content: true,
  type: true,
  createdAt: true,
} satisfies Prisma.InboxItemSelect;

export { INBOX_ITEM_SELECT };
