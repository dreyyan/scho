/**
 * Generate a unique email address.
 *
 * @param prefix Optional prefix for email address.
 * @returns A randomly generated email.
 */
export const generateRandomEmail = (prefix: string = "test") => {
  return `${prefix}-${crypto.randomUUID()}@example.com`;
};
