/**
 * Provides reusable logging methods for application events, warnings, and errors.
 */
export const logger = {
  info: (message: string, ...args: unknown[]) => { console.info(`[INFO] ${message}`, ...args); },
  warn: (message: string, ...args: unknown[]) => { console.info(`[WARN] ${message}`, ...args); },
  error: (message: string, ...args: unknown[]) => { console.info(`[ERROR] ${message}`, ...args); },
};