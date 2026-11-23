import { throwApiError } from '@/lib/utils/api';
import type {
  GetInboxItemsResponse,
  CreateInboxItemResponse,
  InboxItemFormData,
  InboxItemResponse,
  UpdateInboxItemFormData,
  UpdateInboxItemResponse,
} from '@/types/inbox';

const INBOX_API_URL = `/api/inbox`;

/**
 ** Sends a GET request to retrieve the user's inbox items.
 *
 * @returns The user's inbox items in JSON.
 * @throws Error if the request fails.
 */
export async function getInboxItems(): Promise<InboxItemResponse[]> {
  const res = await fetch(INBOX_API_URL);

  if (!res.ok) {
    await throwApiError(res, 'Failed to retrieve inbox items.');
  }

  const result: GetInboxItemsResponse = await res.json();
  return result.data.inboxItems;
}

/**
 ** Sends a POST request to create a new inbox item.
 *
 * @param data - The inbox item data from the form.
 * @returns The response in JSON.
 * @throws Error if the request fails.
 */
export async function createInboxItem(data: InboxItemFormData): Promise<InboxItemResponse> {
  const response = await fetch(INBOX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to create InboxItem.');
  }

  const result: CreateInboxItemResponse = await response.json();
  return result.data.inboxItem;
}

/**
 ** Sends a PATCH request to edit an existing inbox item.
 *
 * @param id - The ID of the inbox item to edit.
 * @param data - The inbox item data from the form.
 * @returns The response in JSON.
 * @throws Error if the request fails.
 */
export async function editInboxItem(id: string, data: UpdateInboxItemFormData) {
  const response = await fetch(`${INBOX_API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to edit inbox item.');
  }

  const result: UpdateInboxItemResponse = await response.json();
  return result.data.inboxItem;
}

/**
 ** Sends a DELETE request to remove an inbox item.
 *
 * @param id - The ID of the inbox item to delete.
 * @throws Error if the request fails.
 */
export async function deleteInboxItem(id: string) {
  const response = await fetch(`${INBOX_API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to delete inbox item.');
  }
}
