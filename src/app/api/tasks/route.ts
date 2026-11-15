import { z } from 'zod';
import { NextResponse } from 'next/server';

import { createTaskSchema } from '@/validations/task';
import { logger } from '@/lib/logger';
import { requireUserId } from '@/lib/auth/require-user-id';
import { createTask, DuplicateSourceItemError, listTasks } from '@/server/tasks';

/**
 ** GET — Retrieve the user's tasks.
 *
 * @returns a JSON response of the user's tasks.
 */
export async function GET() {
  const authResult = await requireUserId();

  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult;

  try {
    const tasks = await listTasks(userId);

    return NextResponse.json(
      {
        message: 'Tasks retrieved successfully.',
        data: { tasks },
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    // Log unexpected task retrieving errors.
    logger.error('Retrieving tasks failed: ', err);

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 ** POST — Create a new task.
 *
 * @param request - The HTTP request containing the new task data.
 * @returns a JSON response of the new task or an error.
 */
export async function POST(request: Request) {
  let body: unknown;

  const authResult = await requireUserId();

  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON request body.' }, { status: 400 });
  }

  // Validate the incoming task creation data.
  const result = createTaskSchema.safeParse(body);

  if (!result.success) {
    // Return field-specific validation errors.
    return NextResponse.json(
      {
        error: 'Invalid task creation data.',
        details: z.flattenError(result.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    // TODO: Validate whether InboxItem belongs to the user.
    const task = await createTask(userId, result.data);

    return NextResponse.json(
      {
        message: 'Task created successfully.',
        data: { task },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    if (err instanceof DuplicateSourceItemError) {
      return NextResponse.json(
        { error: 'Task with the same inbox item already exists.' },
        { status: 409 },
      );
    }

    // Log unexpected task creation errors.
    logger.error('Task creation failed: ', err);

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
