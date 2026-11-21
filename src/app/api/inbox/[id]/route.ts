import { z } from 'zod';
import { NextResponse } from 'next/server';

import { logger } from '@/lib/logger';

import { updateInboxItemSchema } from '@/validations/inbox';
import { requireUserId } from '@/lib/auth/require-user-id';
import { deleteInboxItem, updateInboxItem } from '@/server/inbox';

/**
 ** PATCH — Update an existing inbox item.
 *
 * @param request - The HTTP request containing the updated inbox item data.
 * @param context - The route context containing the inbox item ID.
 * @returns a JSON response of the updated inbox item or an error.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  // Validate the incoming inbox item update data.
  const result = updateInboxItemSchema.safeParse(body);

  if (!result.success) {
    // Return field-specific validation errors.
    return NextResponse.json(
      {
        error: 'Invalid inbox item update data.',
        details: z.flattenError(result.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const inboxItem = await updateInboxItem(userId, inboxItemId, result.data);

    if (!inboxItem) {
      return NextResponse.json({ error: 'Inbox item not found.' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Inbox item updated successfully.',
        data: { inboxItem },
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    // Log unexpected inbox item update errors.
    logger.error('Inbox item update failed: ', err);

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 ** DELETE — Delete an existing inbox item.
 *
 * @param _request - The incoming HTTP request.
 * @param context - The route context containing the inbox item ID.
 * @returns a JSON response indicating success or failure.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: inboxItemId } = await params;

  const authResult = await requireUserId();

  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult;

  const inboxItemIdResult = z.uuid().safeParse(inboxItemId);

  if (!inboxItemIdResult.success) {
    return NextResponse.json({ error: 'Invalid inbox item ID.' }, { status: 400 });
  }

  try {
    const deleted = await deleteInboxItem(userId, inboxItemId);

    if (!deleted) {
      return NextResponse.json({ error: 'Inbox item not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Inbox item deleted successfully.' }, { status: 200 });
  } catch (err: unknown) {
    // Log unexpected inbox item deletion errors.
    logger.error('Inbox item deletion failed: ', err);

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
