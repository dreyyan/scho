'use client';

import { FILTER_OPTIONS, SORT_OPTIONS, TYPE_OPTIONS, INBOX_PER_PAGE } from '@/lib/constants/inbox';
import { getVisibleInboxItems, paginate } from '@/lib/utils/inbox';
import type {
  InboxItemFilter,
  InboxItemResponse,
  InboxItemSort,
  InboxItemType,
} from '@/types/inbox';
import { useState } from 'react';

/**
 * Provides access to Inbox view operations.
 *
 * @param inboxItems - The user's list of inbox items.
 * @returns The inbox item view options and its handlers.
 */
export default function useInboxView(inboxItems: InboxItemResponse[]) {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [type, setType] = useState<InboxItemType>(TYPE_OPTIONS[0].value);
  const [sort, setSort] = useState<InboxItemSort>(SORT_OPTIONS[0].value);
  const [filter, setFilter] = useState<InboxItemFilter>(FILTER_OPTIONS[0].value);

  // Retrieve the filtered and sorted inbox items.
  const visibleInboxItems = getVisibleInboxItems(inboxItems, {
    search,
    type,
    sort,
    filter,
  });

  // Calculate pages information.
  const totalPages = Math.ceil(visibleInboxItems.length / INBOX_PER_PAGE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));

  // Retrieve the inbox items after pagination.
  const paginatedInboxItems = paginate(visibleInboxItems, currentPage, INBOX_PER_PAGE);

  /**
   * Creates a handler that updates a view setting and resets to the first page.
   *
   * @param setter - The inbox item view's setter.
   */
  const resetPageAfter =
    <T>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const changeSearch = resetPageAfter(setSearch);
  const changeType = resetPageAfter(setType);
  const changeSort = resetPageAfter(setSort);
  const changeFilter = resetPageAfter(setFilter);

  return {
    search,
    type,
    sort,
    filter,
    changeSearch,
    changeType,
    changeSort,
    changeFilter,
    changePage: setPage,
    paginatedInboxItems,
    visibleInboxItems,
    currentPage,
    totalPages,
  };
}
