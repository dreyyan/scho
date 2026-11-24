import { SORT_OPTIONS, TYPE_OPTIONS } from '@/lib/constants/inbox';
import { createInboxItemSchema, updateInboxItemSchema } from '@/validations/inbox';
import z from 'zod';

/**
 * Represents the InboxItem form's input data.
 */
export type InboxItemFormData = z.input<typeof createInboxItemSchema>;

/**
 * Represents the update InboxItem form's input data.
 */
export type UpdateInboxItemFormData = z.input<typeof updateInboxItemSchema>;

/**
 * Represents field-specific InboxItem form errors.
 */
export type InboxItemFormErrors = Partial<Record<keyof InboxItemFormData, string>>;

/**
 * Represents an InboxItem's type.
 */
export type InboxItemType = (typeof TYPE_OPTIONS)[number]['value'];

/**
 * Represents an InboxItem's sort type.
 */
export type InboxItemSort = (typeof SORT_OPTIONS)[number]['value'];

/**
 * Represents an InboxItem returned by the backend.
 */
export interface InboxItemResponse {
  id: string;
  content: string;
  type: InboxItemType;
  createdAt: string;
}

/**
 * Represents the API response when retrieving InboxItems.
 */
export interface GetInboxItemsResponse {
  message: string;
  data: {
    inboxItems: InboxItemResponse[];
  };
}

/**
 * Represents the API response when creating an InboxItem.
 */
export interface CreateInboxItemResponse {
  message: string;
  data: {
    inboxItem: InboxItemResponse;
  };
}

/**
 * Represents the API response when editing an InboxItem.
 */
export interface UpdateInboxItemResponse {
  message: string;
  data: {
    inboxItem: InboxItemResponse;
  };
}

/**
 * Represents the options for an InboxItem view.
 */
export interface InboxItemViewOptions {
  search: string;
  type: InboxItemType;
  sort: InboxItemSort;
}
