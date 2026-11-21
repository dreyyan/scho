import type { InboxItemResponse } from '@/types/inbox';
import type { InboxItemViewOptions } from '@/types/inbox';

/**
 * Retrieves the inbox items matching the search, filter, and sort.
 *
 * @param inboxItems - The user's inbox items.
 * @param options - The view options for the inbox item filtering.
 * @returns The filtered and sorted inbox items.
 */
export function getVisibleInboxItems(
  inboxItems: InboxItemResponse[],
  options: InboxItemViewOptions,
): InboxItemResponse[] {
  const { search, type, filter, sort } = options;

  const searchedInboxItems = inboxItems.filter((inboxItem) =>
    inboxItem.content.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const typeFilteredInboxItems = searchedInboxItems.filter((inboxItem) => {
    switch (type) {
      case 'all':
        return true;
      case 'TEXT':
        return inboxItem.type === 'TEXT';
      case 'LINK':
        return inboxItem.type === 'LINK';
      default:
        return true;
    }
  });
  const filteredInboxItems = typeFilteredInboxItems.filter((inboxItem) => {
    switch (filter) {
      case 'unprocessed':
        return inboxItem.task === null;

      case 'converted':
        return inboxItem.task !== null;

      case 'all':
        return true;

      default:
        return true;
    }
  });
  const sortedInboxItems = [...filteredInboxItems].sort((a, b) => {
    switch (sort) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return 0;
    }
  });

  return sortedInboxItems;
}

/**
 * Return `n` inbox items on a specific page number.
 *
 * @param inboxItems - The list of inbox items.
 * @param page - The page number.
 * @param perPage - The number of inbox items to display per page.
 *
 * @returns The inbox items on that page.
 */
export function paginate<T>(items: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  const end = page * perPage;

  return items.slice(start, end);
}
