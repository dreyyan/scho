import { logger } from "../logger";

/**
 * Throws an error if API response fails.
 * 
 * @param response - The response from the API route.
 * @param fallbackMessage - The fallback error message to display.
 */
export async function throwApiError(
  response: Response,
  fallbackMessage: string,
) {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const errMsg = body?.error ?? fallbackMessage;
    logger.error(errMsg);
    throw new Error(errMsg);
  }
};