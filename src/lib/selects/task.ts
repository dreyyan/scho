import { Prisma } from "@/generated/prisma/client";

/**
 * Represents the fields returned to the client for a task.
 * Shared by every task route for consistent responses.
 */
const TASK_SELECT = {
  id: true,
  title: true,
  isCompleted: true,
  deadline: true,
  createdAt: true,
} satisfies Prisma.TaskSelect;

export { TASK_SELECT };