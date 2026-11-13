import { throwApiError } from "@/lib/utils/api";
import type {
  GetTasksResponse,
  CreateTaskResponse,
  TaskFormData,
  TaskResponse,
  UpdateTaskFormData,
  UpdateTaskResponse
} from "@/types/task";

const TASK_API_URL = `/api/tasks`;

/**
 ** Sends a GET request to retrieve the user's tasks.
 * 
 * @returns The user's tasks in JSON.
 * @throws Error if the request fails.
 */
export async function getTasks(): Promise<TaskResponse[]> {
  const response = await fetch(TASK_API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to retrieve tasks.');
  }

  const result: GetTasksResponse = await response.json();

  return result.data.tasks;
}

/**
 ** Sends a POST request to create a new task.
 * 
 * @param data - The task data from the form.
 * @returns The response in JSON.
 * @throws Error if the request fails.
 */
export async function createTask(data: TaskFormData): Promise<TaskResponse> {
  const response = await fetch(TASK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to create task.');
  }

  const result: CreateTaskResponse = await response.json();

  return result.data.task;
}

/**
 ** Sends a PATCH request to edit an existing task.
 * 
 * @param id - The ID of the task to edit.
 * @param data - The task data from the form.
 * @returns The response in JSON.
 * @throws Error if the request fails.
 */
export async function editTask(id: string, data: UpdateTaskFormData) {
  const response = await fetch(`${TASK_API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to edit task.');
  }

  const result: UpdateTaskResponse = await response.json();

  return result.data.task;
}

/**
 ** Sends a DELETE request to remove a task.
 *
 * @param id - The ID of the task to delete.
 * @throws Error if the request fails.
 */
export async function deleteTask(id: string) {
  const response = await fetch(`${TASK_API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to delete task.');
  }
}