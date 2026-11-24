import { z } from 'zod';
import { NextResponse } from 'next/server';

import { logger } from '@/lib/logger';

import { requireUserId } from '@/lib/auth/require-user-id';
import { convertInboxItem } from '@/server/inbox';
import { createTaskSchema } from '@/validations/task';

/**
 ** POST — Convert an inbox item to task.
 *
 * @param request - The HTTP request containing the task form data.
 * @param context - The route context containing the inbox item ID.
 * @returns a JSON response of the converted task or an error.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let body: unknown;
  const { id: inboxItemId } = await params;

  const authResult = await requireUserId();

  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult;

  const inboxItemIdResult = z.uuid().safeParse(inboxItemId);

  if (!inboxItemIdResult.success) {
    return NextResponse.json({ error: 'Invalid inbox item ID.' }, { status: 400 });
  }

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON request body.' }, { status: 400 });
  }

  // Validate the incoming task conversion data.
  const result = createTaskSchema.safeParse(body);

  if (!result.success) {
    // Return field-specific validation errors.
    return NextResponse.json(
      {
        error: 'Invalid task conversion data.',
        details: z.flattenError(result.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const task = await convertInboxItem(userId, inboxItemId, result.data);

    if (!task) {
      return NextResponse.json({ error: 'Inbox item not found.' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Inbox item converted successfully.',
        data: { task },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    // Log unexpected inbox item conversion errors.
    logger.error('Inbox item conversion failed: ', err);

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
