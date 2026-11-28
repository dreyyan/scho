import { z } from 'zod';
import { NextResponse } from 'next/server';

import { requireUserId } from '@/lib/auth/require-user-id';
import { logger } from '@/lib/logger';
import { changePasswordSchema } from '@/validations/settings';
import { changePassword } from '@/server/settings';

/**
 ** PATCH — Update the user's password.
 *
 * @param request - The HTTP request containing the user's updated password.
 * @returns a JSON response of the user's password change or an error.
 */
export async function PATCH(request: Request) {
  let body: unknown;

  const authResult = await requireUserId();

  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON request body.' }, { status: 400 });
  }

  // Validate the incoming change password data.
  const result = changePasswordSchema.safeParse(body);

  if (!result.success) {
    // Return field-specific validation errors.
    return NextResponse.json(
      {
        error: 'Invalid change password data.',
        details: z.flattenError(result.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const status = await changePassword(userId, result.data);

    if (status === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (status === 'INVALID_PASSWORD') {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password changed successfully.' }, { status: 200 });
  } catch (err: unknown) {
    // Log unexpected change password errors.
    logger.error('Change password failed: ', err);

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
