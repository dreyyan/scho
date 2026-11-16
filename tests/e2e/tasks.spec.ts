import { test, expect } from '@playwright/test';
import { validTaskCreationData } from '../fixtures/task';

test.describe('Tasks', () => {
  test.describe('when logged out', () => {
    // Start logged out: the config loads a saved session for every test by default.
    test.use({ storageState: { cookies: [], origins: [] } });

    test('redirects to the login page', async ({ page }) => {
      await page.goto('/tasks');

      await expect(page).toHaveURL(/\/login\/?$/);
    });
  });

  test.describe('when logged in', () => {
    test('creates a task', async ({ page }) => {
      // Test whether user is in the right page.
      await page.goto('/tasks');
      await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible();

      // Test whether Add task form modal is displayed.
      const addTaskButton = page.getByRole('button', { name: 'Add Task', exact: true });
      await addTaskButton.click();
      const dialog = page.getByRole('dialog', { name: 'Add task', exact: true });
      await expect(dialog).toBeVisible();

      // Test whether input fields are displayed.
      const taskNameInputField = dialog.getByLabel('Task Name');
      const deadlineInputField = dialog.getByLabel('Deadline');

      // Fill in input fields with values.
      const deadline = '2099-12-31T09:00';
      const title = `${validTaskCreationData.title} ${Date.now()}`;
      await taskNameInputField.fill(title);
      await deadlineInputField.fill(deadline);

      // Submit the form.
      const addButton = dialog.getByRole('button', { name: 'Add', exact: true });
      await addButton.click();

      // Test whether the task creation confirmation modal is displayed.
      const confirmationDialog = page.getByRole('dialog', { name: 'Task created', exact: true });
      await expect(confirmationDialog).toBeVisible();

      // Close the modal.
      const confirmationPrimaryButton = confirmationDialog.getByRole('button', {
        name: 'Got it',
        exact: true,
      });
      await confirmationPrimaryButton.click();

      // Confirm that confirmation modal closed.
      await expect(confirmationDialog).not.toBeVisible();

      // Check whether the task exists and is displayed.
      const task = page.getByRole('listitem').filter({ hasText: title });
      await expect(task).toBeVisible();
    });
    // test('edits a task', () => {});
    // test('deletes a task', () => {});
  });
});
