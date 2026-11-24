import { z } from 'zod';
import { emailSchema, passwordSchema } from './common';

const accountInformationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(100, 'Name must not exceed 100 characters.'),
  email: emailSchema('Invalid email.'),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password is the same as current password.',
    path: ['newPassword'],
  });

export { accountInformationSchema, changePasswordSchema };
