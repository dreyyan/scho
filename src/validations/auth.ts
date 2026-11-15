import { z } from 'zod';

const registerSchema = z
  .object({
    email: z.email({ error: 'Invalid email or password.' }).trim().toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must contain at least 8 characters.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: z.email({ error: 'Invalid email or password.' }).trim().toLowerCase(),
  password: z.string().min(1, 'Invalid email or password.'),
});

export { registerSchema, loginSchema };
