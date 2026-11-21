import { APIRequestContext } from '@playwright/test';

/**
 * Creates an inbox item through the API.
 *
 * @param request - The API request context.
 * @param content - The inbox item's content.
 * @returns The new inbox item.
 * @throws Error if the request fails.
 */
export const createInboxItem = async (request: APIRequestContext, content: string) => {
  const res = await request.post('/api/inbox', { data: { content } });

  if (!res.ok()) {
    throw new Error('Failed to create inbox item.');
  }

  const result = await res.json();
  return result.data.inboxItem;
};
