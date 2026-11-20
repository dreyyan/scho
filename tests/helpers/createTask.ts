import { APIRequestContext } from '@playwright/test';

/**
 * Creates a task through the API.
 *
 * @param request - The API request context.
 * @param title - The task's title.
 * @returns The new task.
 * @throws Error if the request fails.
 */
export const createTask = async (request: APIRequestContext, title: string) => {
  const res = await request.post('/api/tasks', { data: { title } });

  if (!res.ok()) {
    throw new Error('Failed to create task.');
  }

  const result = await res.json();
  return result.data.task;
};
