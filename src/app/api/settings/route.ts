import { z } from 'zod';
import { NextResponse } from 'next/server';

import { fetchAccountInformation, updateAccountInformation } from '@/server/settings';
import { requireUserId } from '@/lib/auth/require-user-id';
import { logger } from '@/lib/logger';
import { accountInformationSchema } from '@/validations/settings';
import { Prisma } from '@/generated/prisma/client';

/**
 ** GET — Retrieve the user's account information.
 *
 * @returns a JSON response of the user's account information.
 */
export async function GET() {
  const authResult = await requireUserId();

  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult;

  try {
    const accountInformation = await fetchAccountInformation(userId);

    if (!accountInformation) {
      return NextResponse.json(
        {
          error: 'User not found.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: 'Account information retrieved successfully.',
        data: { accountInformation },
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    // Log unexpected account information retrieving errors.
    logger.error('Retrieving account information failed: ', err);

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 ** PATCH — Update the user's account information.
 *
 * @param request - The HTTP request containing the user's updated account information.
 * @returns a JSON response of the user's updated account information or an error.
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

  // Validate the incoming account information update data.
  const result = accountInformationSchema.safeParse(body);

  if (!result.success) {
    // Return field-specific validation errors.
    return NextResponse.json(
      {
        error: 'Invalid account information update data.',
        details: z.flattenError(result.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const accountInformation = await updateAccountInformation(userId, result.data);

    return NextResponse.json(
      {
        message: 'Account information updated successfully.',
        data: { accountInformation },
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    // Handle Prisma unique constraint (P2002) and record not found (P2025) errors.
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return NextResponse.json({ error: 'Email is already in use.' }, { status: 409 });
      }
      if (err.code === 'P2025') {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
      }
    }

    // Log unexpected account information update errors.
    logger.error('Account information update failed: ', err);

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
