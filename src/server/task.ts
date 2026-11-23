import 'server-only';

import { prisma } from '@/lib/prisma';
import { TASK_SELECT } from '@/lib/selects/task';
import { TaskFormData, UpdateTaskFormData } from '@/types/task';
import { Prisma } from '@/generated/prisma/client';

export class DuplicateSourceItemError extends Error {
  constructor() {
    super('A task is already linked to this inbox item.');
    this.name = 'DuplicateSourceItemError';
  }
}

export class SourceItemNotFoundError extends Error {
  constructor() {
    super('The source inbox item cannot be found for this task.');
    this.name = 'SourceItemNotFoundError';
  }
}

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
 * @throws {DuplicateSourceItemError} If the inbox item is already linked to a task.
 * @throws {SourceItemNotFoundError} If the inbox item doesn't exist or isn't owned by the user.
 */
export async function createTask(userId: string, data: TaskFormData) {
  const { title, sourceItemId, deadline } = data;

  // Check inbox item ownership.
  if (sourceItemId) {
    const inboxItem = await prisma.inboxItem.findFirst({ where: { id: sourceItemId, userId } });

    if (!inboxItem) {
      throw new SourceItemNotFoundError();
    }
  }

  try {
    return await prisma.task.create({
      data: {
        userId,
        ...(sourceItemId !== undefined && { sourceItemId }),
        title,
        deadline,
      },
      select: TASK_SELECT,
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new DuplicateSourceItemError();
    }

    throw err;
  }
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

  try {
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
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return null;
    }

    throw err;
  }
}

/**
 * Delete a user's task from the database.
 *
 * @param userId - THe user's ID;
 * @param taskId - The task's ID.
 * @returns True or false, depending on whether the operation succeeded.
 */
export async function deleteTask(userId: string, taskId: string): Promise<boolean> {
  try {
    await prisma.task.delete({
      where: {
        id: taskId,
        userId,
      },
    });

    return true;
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return false;
    }

    throw err;
  }
}
