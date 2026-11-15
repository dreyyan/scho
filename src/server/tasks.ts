import 'server-only';

import { prisma } from '@/lib/prisma';
import { TASK_SELECT } from '@/lib/selects/task';
import { TaskFormData, UpdateTaskFormData } from '@/types/task';
import { Prisma } from '@/generated/prisma/client';
import { NextResponse } from 'next/server';

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
 * @returns The new task or a NextResponse JSON containing the error message and status code. 
 */
export async function createTask(userId: string, data: TaskFormData) {
  const { title, sourceItemId, deadline } = data;

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
      return NextResponse.json(
        { error: 'Task with the same inbox item already exists.' },
        { status: 409 },
      );
    }
  }
}

/**
 * Update a user's task in the database.
 * 
 * @param userId - The user's ID.
 * @param taskId - The task's ID.
 * @param data - THe form data for the updated task.
 * @returns The updated task or a NextResponse JSON containing the error message and status code. 
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
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }
  }
}