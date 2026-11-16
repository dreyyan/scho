'use client';

import { FILTER_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS, TASKS_PER_PAGE } from '@/lib/constants/task';
import { getVisibleTasks, paginate } from '@/lib/utils/task';
import type { TaskFilter, TaskResponse, TaskSort, TaskStatus } from '@/types/task';
import { useEffect, useState } from 'react';

/**
 * Provides access to Task view operations.
 *
 * @param tasks - The user's list of tasks.
 * @returns The task view options and its handlers.
 */
export default function useTaskView(tasks: TaskResponse[]) {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus>(STATUS_OPTIONS[0].value);
  const [sort, setSort] = useState<TaskSort>(SORT_OPTIONS[0].value);
  const [filter, setFilter] = useState<TaskFilter>(FILTER_OPTIONS[0].value);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Update time every 60 seconds.
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(Date.now());
    };

    const interval = setInterval(updateTime, 60_000);

    return () => clearInterval(interval);
  }, []);

  // Retrieve the filtered and sorted tasks.
  const visibleTasks = getVisibleTasks(tasks, {
    search,
    status,
    sort,
    filter,
    currentTime,
  });

  // Calculate pages information.
  const totalPages = Math.ceil(visibleTasks.length / TASKS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));

  // Retrieve the tasks after pagination.
  const paginatedTasks = paginate(visibleTasks, currentPage, TASKS_PER_PAGE);

  /**
   * Creates a handler that updates a view setting and resets to the first page.
   *
   * @param setter - The task view's setter.
   */
  const resetPageAfter =
    <T>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const changeSearch = resetPageAfter(setSearch);
  const changeStatus = resetPageAfter(setStatus);
  const changeSort = resetPageAfter(setSort);
  const changeFilter = resetPageAfter(setFilter);

  return {
    search,
    status,
    sort,
    filter,
    changeSearch,
    changeStatus,
    changeSort,
    changeFilter,
    changePage: setPage,
    paginatedTasks,
    visibleTasks,
    currentPage,
    totalPages,
  };
}
