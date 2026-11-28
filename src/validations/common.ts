import { z } from 'zod';

const emailSchema = (error: string) => z.string().trim().toLowerCase().pipe(z.email({ error }));
const passwordSchema = z
  .string()
  .min(8, 'Password must contain at least 8 characters.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol.');

export { emailSchema, passwordSchema };
