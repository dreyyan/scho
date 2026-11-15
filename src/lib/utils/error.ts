import { DEFAULT_ERROR_MESSAGE } from '../constants/error';

/**
 * Return the message of an Error, or a generic fallback for any other thrown value.
 *
 * @param err - The error.
 * @returns The error message.
 */
export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE;
}
