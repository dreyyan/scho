'use client';

import { FILTER_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from '@/lib/constants/task';
import { useState } from 'react';

/**
 * Provides access to Task view operations.
 *
 * @returns The task view options and its handlers.
 */
export default function useTaskView() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>(STATUS_OPTIONS[0].value);
  const [sort, setSort] = useState<string>(SORT_OPTIONS[0].value);
  const [filter, setFilter] = useState<string>(FILTER_OPTIONS[0].value);

  /**
   * Creates a handler that updates a view setting and resets to the first page.
   *
   * @param setter - The task view's setter.
   */
  const resetPageAfter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const changeSearch = resetPageAfter(setSearch);
  const changeStatus = resetPageAfter(setStatus);
  const changeSort = resetPageAfter(setSort);
  const changeFilter = resetPageAfter(setFilter);

  return {
    page,
    search,
    status,
    sort,
    filter,
    changeSearch,
    changeStatus,
    changeSort,
    changeFilter,
    changePage: setPage,
  };
}
