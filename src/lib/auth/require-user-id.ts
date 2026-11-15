import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { logger } from '../logger';

/**
 * Requires an authenticated user.
 *
 * @returns the authorized user's ID or a NextResponse containing the error message and status.
 */
export async function requireUserId(): Promise<string | NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    return session.user.id;
  } catch (err: unknown) {
    logger.error('Authentication failed: ', err);

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
