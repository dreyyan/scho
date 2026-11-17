import type { Page } from '@playwright/test';

/**
 * Access the Task form's elements.
 *
 * @param page - The page representing as the browser tab.
 * @param title - The form's title
 * @param buttonLabel - The task form button's label.
 * @returns The task form's locators.
 */
export const getTaskForm = (page: Page, title: string, buttonLabel: string) => {
  const dialog = page.getByRole('dialog', { name: title, exact: true });
  return {
    dialog,
    taskNameInputField: dialog.getByLabel('Task Name'),
    deadlineInputField: dialog.getByLabel('Deadline'),
    actionButton: dialog.getByRole('button', { name: buttonLabel, exact: true }),
  };
};
