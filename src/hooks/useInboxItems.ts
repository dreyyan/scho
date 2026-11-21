'use client';

import * as inboxItemApi from '@/lib/api-client/inbox';
import { getErrorMessage } from '@/lib/utils/error';
import type { InboxItemFormData, InboxItemResponse, UpdateInboxItemFormData } from '@/types/inbox';
import { useEffect, useState } from 'react';

/**
 * Provides access to InboxItem operations.
 *
 * @returns The user's inbox items, loading and error state, and retry function.
 */
export default function useInboxItems() {
  const [inboxItems, setInboxItems] = useState<InboxItemResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Retrieve the user's inbox items from the backend.
  useEffect(() => {
    let ignore = false;

    const fetchInboxItems = async () => {
      try {
        const fetchedInboxItems = await inboxItemApi.getInboxItems();
        if (!ignore) setInboxItems(fetchedInboxItems);
      } catch (err: unknown) {
        if (!ignore) {
          console.error('Failed to retrieve inbox items: ', err);
          setError(getErrorMessage(err));
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchInboxItems();

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
   * Creates an inbox item on the server, then adds it to local state.
   *
   * @param data - The inbox item data from the form.
   * @throws If the request fails; local state is left unchanged.
   */
  const addInboxItem = async (data: InboxItemFormData) => {
    const newInboxItem = await inboxItemApi.createInboxItem(data);

    setInboxItems((prevInboxItems) => [...prevInboxItems, newInboxItem]);
  };

  /**
   * Updates an inbox item on the server, then updates it in local state.
   *
   * @param id - The inbox item's ID.
   * @param data - The inbox item data from the form.
   * @throws If the request fails; local state is left unchanged.
   */
  const editInboxItem = async (id: string, data: UpdateInboxItemFormData) => {
    const updatedInboxItem = await inboxItemApi.editInboxItem(id, data);

    setInboxItems((prevInboxItems) =>
      prevInboxItems.map((inboxItem) => (inboxItem.id === id ? updatedInboxItem : inboxItem)),
    );
  };

  /**
   * Deletes an inbox item on the server, then removes it from the local state.
   *
   * @param id - The inbox item's ID.
   * @throws If the request fails; local state is left unchanged.
   */
  const deleteInboxItem = async (id: string) => {
    await inboxItemApi.deleteInboxItem(id);

    setInboxItems((prevInboxItems) => prevInboxItems.filter((inboxItem) => inboxItem.id !== id));
  };

  return {
    inboxItems,
    isLoading,
    error,
    retry,
    addInboxItem,
    editInboxItem,
    deleteInboxItem,
  };
}
