import { throwApiError } from '../utils/api';
import type {
  AccountInformationFormData,
  AccountInformationResponse,
  GetAccountInformationResponse,
  UpdateAccountInformationResponse,
} from '@/types/settings';

import { SETTINGS_API_URL } from '../constants/settings';

/**
 ** Sends a GET request to retrieve the user's account information.
 *
 * @returns The user's account information.
 * @throws Error if the request fails.
 */
export async function getAccountInformation(): Promise<AccountInformationResponse> {
  const res = await fetch(SETTINGS_API_URL);

  if (!res.ok) {
    await throwApiError(res, "Failed to retrieve the user's account information.");
  }

  const result: GetAccountInformationResponse = await res.json();
  return result.data.accountInformation;
}

/**
 ** Sends a PATCH request to update the user's account information.
 *
 * @param data - The user's account information data from the form.
 * @returns The updated account information.
 * @throws Error if the request fails.
 */
export async function updateAccountInformation(
  data: AccountInformationFormData,
): Promise<AccountInformationResponse> {
  const res = await fetch(SETTINGS_API_URL, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await throwApiError(res, 'Failed to update account information.');
  }

  const result: UpdateAccountInformationResponse = await res.json();
  return result.data.accountInformation;
}
