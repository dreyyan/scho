import { createTaskSchema, updateTaskSchema } from "@/validations/task";
import z from 'zod';

/**
 * Represents the task form's input data.
 */
export type TaskFormData = z.input<typeof createTaskSchema>;

/**
 * Represents the update task form's input data.
 */
export type UpdateTaskFormData = z.input<typeof updateTaskSchema>;

/**
 * Represents field-specific task form errors.
 */
export type TaskFormErrors = Partial<Record<keyof TaskFormData, string>>;

/**
 * Represents a task returned by the backend.
 */
export interface TaskResponse {
  id: string;
  title: string;
  isCompleted: boolean;
  deadline?: string | null;
  createdAt: string;
}

/**
 * Represents the API response when retrieving tasks.
 */
export interface GetTasksResponse {
  message: string;
  data: {
    tasks: TaskResponse[];
  };
}

/**
 * Represents the API response when creating a task.
 */
export interface CreateTaskResponse {
  message: string;
  data: {
    task: TaskResponse
  };
}

/**
 * Represents the API response when editing a task.
 */
export interface UpdateTaskResponse {
  message: string;
  data: {
    task: TaskResponse;
  }
}

/**
 * Represents the options for a Task view.
 */
export interface TaskViewOptions {
  search: string;
  status: string;
  filter: string;
  sort: string;
  currentTime: number;
}