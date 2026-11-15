import { z } from 'zod';
import { NextResponse } from 'next/server';

import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

import { updateTaskSchema } from '@/validations/task';
import { TASK_SELECT } from '@/lib/selects/task';
import { requireUserId } from '@/lib/auth/require-user-id';

/**
 ** PATCH — Update an existing task.
 *
 * @param request - The HTTP request containing the updated task data.
 * @param context - The route context containing the task ID.
 * @returns a JSON response of the updated task or an error.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let body: unknown;
  const { id: taskId } = await params;

  const authResult = await requireUserId();

  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult;

  const taskIdResult = z.uuid().safeParse(taskId);

  if (!taskIdResult.success) {
    return NextResponse.json({ error: 'Invalid task ID.' }, { status: 400 });
  }

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON request body.' }, { status: 400 });
  }

  // Validate the incoming task update data.
  const result = updateTaskSchema.safeParse(body);

  if (!result.success) {
    // Return field-specific validation errors.
    return NextResponse.json(
      {
        error: 'Invalid task update data.',
        details: z.flattenError(result.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  const { title, isCompleted, deadline } = result.data;

  try {
    const task = await updateTask(userId, taskId, result.data);

    return NextResponse.json(
      {
        message: 'Task updated successfully.',
        data: { task },
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    // Log unexpected task update errors.
    logger.error('Task update failed: ', err);

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 ** DELETE — Delete an existing task.
 *
 * @param _request - The incoming HTTP request.
 * @param context - The route context containing the task ID.
 * @returns a JSON response indicating success or failure.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: taskId } = await params;

  const authResult = await requireUserId();

  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult;

  const taskIdResult = z.uuid().safeParse(taskId);

  if (!taskIdResult.success) {
    return NextResponse.json({ error: 'Invalid task ID.' }, { status: 400 });
  }

  try {
    // TODO: Delete InboxItem linked with the task.
    await prisma.task.delete({
      where: {
        id: taskId,
        userId,
      },
    });

    return NextResponse.json({ message: 'Task deleted successfully.' }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    // Log unexpected task deletion errors.
    logger.error('Task deletion failed: ', err);

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
