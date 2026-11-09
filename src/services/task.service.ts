import { logger } from "@/lib/logger";
import type {
  GetTasksResponse,
  CreateTaskResponse,
  TaskFormData,
  TaskResponse
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
    const errMsg = 'Failed to retrieve tasks';
    logger.error(errMsg);
    throw new Error(errMsg);
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
    const errMsg = 'Failed to create task';
    logger.error(errMsg);
    throw new Error(errMsg);
  }

  const result: CreateTaskResponse = await response.json();

  return result.data.task;
}