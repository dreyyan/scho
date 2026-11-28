'use client';

import * as settingsApi from '@/lib/api-client/settings';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/lib/utils/error';
import type { AccountInformationFormData, AccountInformationResponse } from '@/types/settings';
import { useEffect, useState } from 'react';

/**
 * Provides access to the user's account information operations.
 *
 * @returns The user's account information, loading and error state, and retry function.
 */
export default function useAccountInformation() {
  const [accountInformation, setAccountInformation] = useState<AccountInformationResponse>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Retrieve the user's account information from the backend.
  useEffect(() => {
    let ignore = false;

    const fetchAccountInformation = async () => {
      try {
        const fetchedAccountInformation = await settingsApi.getAccountInformation();
        if (!ignore) setAccountInformation(fetchedAccountInformation);
      } catch (err: unknown) {
        if (!ignore) {
          logger.error("Failed to retrieve user's account information: ", err);
          setError(getErrorMessage(err));
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchAccountInformation();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setError(null);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  /**
   * Updates the user's account information on the server, then updates it in local state.
   *
   * @param data - The user's account information data from the form.
   * @throws If the request fails; local state is left unchanged.
   */
  const updateAccountInformation = async (data: AccountInformationFormData) => {
    const updatedAccountInformation = await settingsApi.updateAccountInformation(data);

    setAccountInformation(updatedAccountInformation);
  };

  return {
    accountInformation,
    isLoading,
    error,
    retry,
    updateAccountInformation,
  };
}
