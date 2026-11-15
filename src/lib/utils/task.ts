import type { TaskResponse } from '@/types/task';
import type { TaskViewOptions } from '@/types/task';

/**
 * Retrieves the tasks matching the search, filter, and sort.
 *
 * @param tasks - The user's tasks.
 * @param options - The view options for the task filtering.
 * @returns The filtered and sorted tasks.
 */
export function getVisibleTasks(tasks: TaskResponse[], options: TaskViewOptions): TaskResponse[] {
  const { search, status, filter, sort, currentTime } = options;

  const searchedTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const statusFilteredTasks = searchedTasks.filter((task) => {
    switch (status) {
      case 'active':
        return !task.isCompleted;
      case 'completed':
        return task.isCompleted;
      case 'all':
        return true;
      default:
        return true;
    }
  });
  const filteredTasks = statusFilteredTasks.filter((task) => {
    switch (filter) {
      case 'with-deadline':
        return !!task.deadline;

      case 'no-deadline':
        return !task.deadline;

      case 'overdue':
        return (
          !!task.deadline && !task.isCompleted && new Date(task.deadline).getTime() < currentTime
        );

      default:
        return true;
    }
  });
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sort) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'due-asc':
      case 'due-desc': {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;

        const aTime = new Date(a.deadline).getTime();
        const bTime = new Date(b.deadline).getTime();

        return sort === 'due-asc' ? aTime - bTime : bTime - aTime;
      }
      case 'title-asc':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return sortedTasks;
}

/**
 * Return `n` items on a specific page number.
 *
 * @param items - The list of items.
 * @param page - The page number.
 * @param perPage - The number of items to display per page.
 *
 * @returns The items on that page.
 */
export function paginate<T>(items: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  const end = page * perPage;

  return items.slice(start, end);
}
