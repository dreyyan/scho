import { accountInformationSchema, changePasswordSchema } from '@/validations/settings';
import { z } from 'zod';

/**
 * Represents the account information form's input data.
 */
export type AccountInformationFormData = z.input<typeof accountInformationSchema>;

/**
 * Represents the change password form's input data.
 */
export type ChangePasswordFormData = z.input<typeof changePasswordSchema>;

/**
 * Represents field-specific account information form errors.
 */
export type AccountInformationFormErrors = Partial<
  Record<keyof AccountInformationFormData, string>
>;

/**
 * Represents field-specific change password form errors.
 */
export type ChangePasswordFormErrors = Partial<Record<keyof ChangePasswordFormData, string>>;

/**
 * Represents a user's account information returned by the backend.
 */
export interface AccountInformationResponse {
  id: string;
  name: string | null;
  email: string;
}

/**
 * Represents the API response when retrieving a user's account information.
 */
export interface GetAccountInformationResponse {
  message: string;
  data: {
    accountInformation: AccountInformationResponse;
  };
}

/**
 * Represents the API response when updating a user's account information.
 */
export interface UpdateAccountInformationResponse {
  message: string;
  data: {
    accountInformation: AccountInformationResponse;
  };
}
