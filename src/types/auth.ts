import { registerSchema } from "@/validations/auth";
import z from 'zod';

/**
 * Represents the registration form's input data.
 */
export type RegisterFormData = z.input<typeof registerSchema>;

/**
 * Represents field-specific registration errors.
 */
export type RegisterFormErrors = Partial<Record<keyof RegisterFormData, string>>;