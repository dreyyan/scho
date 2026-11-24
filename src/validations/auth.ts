import { z } from 'zod';
import { emailSchema, passwordSchema } from './common';

const registerSchema = z
  .object({
    email: emailSchema('Invalid email or password.'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: emailSchema('Invalid email or password.'),
  password: z.string().min(1, 'Invalid email or password.'),
});

export { registerSchema, loginSchema };
