import 'server-only';

import { prisma } from '@/lib/prisma';
import { TASK_SELECT } from '@/lib/selects/task';
import { TaskFormData, UpdateTaskFormData } from '@/types/task';

/**
 * Retrieve the user's tasks from the databsae.
 * 
 * @param userId - The user's ID.
 * @returns The user's tasks.
 */
export async function listTasks(userId: string) {
  return prisma.task.findMany({
    where: {
      userId,
    },
    select: TASK_SELECT,
  });
}

/**
 * Create a task for the user in the database.
 * 
 * @param userId - The user's ID.
 * @param data - The form data for the new task.
 * @returns The new task.
 */
export async function createTask(userId: string, data: TaskFormData) {
  const { title, sourceItemId, deadline } = data;

  return await prisma.task.create({
    data: {
      userId,
      ...(sourceItemId !== undefined && { sourceItemId }),
      title,
      deadline,
    },
    select: TASK_SELECT,
  });
}

/**
 * Update a user's task in the database.
 * 
 * @param userId - The user's ID.
 * @param taskId - The task's ID.
 * @param data - THe form data for the updated task.
 * @returns The updated task.
 */
export async function updateTask(userId: string, taskId: string, data: UpdateTaskFormData) {
  const { title, isCompleted, deadline } = data;

  return await prisma.task.update({
    where: {
      id: taskId,
      userId,
    },
    data: {
      title,
      isCompleted,
      deadline,
    },
    select: TASK_SELECT,
  });
}