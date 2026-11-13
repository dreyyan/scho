import { logger } from "../logger";

/**
 * Throws an error using the API's error message, or a fallback if none is available.
 * 
 * @param response - The response from the API route.
 * @param fallbackMessage - The fallback error message to display.
 */
export async function throwApiError(
  response: Response,
  fallbackMessage: string,
): Promise<never> {
  const body = await response.json().catch(() => null);
  const errMsg = body?.error ?? fallbackMessage;
  logger.error(errMsg);
  throw new Error(errMsg);
};