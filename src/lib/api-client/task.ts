import { throwApiError } from '@/lib/utils/api';
import type {
  GetTasksResponse,
  CreateTaskResponse,
  TaskFormData,
  TaskResponse,
  UpdateTaskFormData,
  UpdateTaskResponse,
} from '@/types/task';

import { TASKS_API_URL } from '../constants/task';

/**
 ** Sends a GET request to retrieve the user's tasks.
 *
 * @returns The user's tasks.
 * @throws Error if the request fails.
 */
export async function getTasks(): Promise<TaskResponse[]> {
  const res = await fetch(TASKS_API_URL);

  if (!res.ok) {
    await throwApiError(res, 'Failed to retrieve tasks.');
  }

  const result: GetTasksResponse = await res.json();
  return result.data.tasks;
}

/**
 ** Sends a POST request to create a new task.
 *
 * @param data - The task data from the form.
 * @returns The created task.
 * @throws Error if the request fails.
 */
export async function createTask(data: TaskFormData): Promise<TaskResponse> {
  const res = await fetch(TASKS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await throwApiError(res, 'Failed to create task.');
  }

  const result: CreateTaskResponse = await res.json();
  return result.data.task;
}

/**
 ** Sends a PATCH request to edit an existing task.
 *
 * @param id - The ID of the task to edit.
 * @param data - The task data from the form.
 * @returns The edited task.
 * @throws Error if the request fails.
 */
export async function editTask(id: string, data: UpdateTaskFormData) {
  const res = await fetch(`${TASKS_API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await throwApiError(res, 'Failed to edit task.');
  }

  const result: UpdateTaskResponse = await res.json();
  return result.data.task;
}

/**
 ** Sends a DELETE request to remove a task.
 *
 * @param id - The ID of the task to delete.
 * @throws Error if the request fails.
 */
export async function deleteTask(id: string) {
  const res = await fetch(`${TASKS_API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    await throwApiError(res, 'Failed to delete task.');
  }
}
