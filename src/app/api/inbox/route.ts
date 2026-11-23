import { z } from 'zod';
import { NextResponse } from 'next/server';

import { createInboxItemSchema } from '@/validations/inbox';
import { logger } from '@/lib/logger';
import { requireUserId } from '@/lib/auth/require-user-id';
import { createInboxItem, listInboxItems } from '@/server/inbox';

/**
 ** GET — Retrieve the user's inbox items.
 *
 * @returns a JSON response of the user's inbox items.
 */
export async function GET() {
  const authResult = await requireUserId();

  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult;

  try {
    const inboxItems = await listInboxItems(userId);

    return NextResponse.json(
      {
        message: 'Inbox items retrieved successfully.',
        data: { inboxItems },
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    // Log unexpected inbox item retrieving errors.
    logger.error('Retrieving inbox items failed: ', err);

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 ** POST — Create a new inbox item.
 *
 * @param request - The HTTP request containing the new inbox item data.
 * @returns a JSON response of the new inbox item or an error.
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

  // Validate the incoming inbox item creation data.
  const result = createInboxItemSchema.safeParse(body);

  if (!result.success) {
    // Return field-specific validation errors.
    return NextResponse.json(
      {
        error: 'Invalid inbox item creation data.',
        details: z.flattenError(result.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const inboxItem = await createInboxItem(userId, result.data);

    return NextResponse.json(
      {
        message: 'Inbox item created successfully.',
        data: { inboxItem },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    // Log unexpected inbox item creation errors.
    logger.error('Inbox item creation failed: ', err);

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
