import type { Page } from '@playwright/test';

/**
 * Access the InboxItem form's locators.
 *
 * @param page - The page representing the browser tab.
 * @param content - The form's content.
 * @param buttonLabel - The inbox item form button's label.
 * @returns The inbox item form's locators.
 */
export const getInboxItemForm = (page: Page, content: string, buttonLabel: string) => {
  const dialog = page.getByRole('dialog', { name: content, exact: true });
  return {
    dialog,
    contentInputField: dialog.getByLabel('Content'),
    actionButton: dialog.getByRole('button', { name: buttonLabel, exact: true }),
  };
};
