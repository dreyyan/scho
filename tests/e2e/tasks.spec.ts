import { test, expect } from '@playwright/test';
import { validTaskCreationData } from '../fixtures/task';
import { getTaskForm } from '../helpers/getTaskForm';

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
    test.describe("when the 'Add task' dialog is open", () => {
      test.beforeEach(async ({ page }) => {
        // Navigate to 'Tasks' page.
        await page.goto('/tasks');
        await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible();

        // Click the 'Add task' button.
        const addTaskButton = page.getByRole('button', { name: 'Add task', exact: true });
        await addTaskButton.click();

        const { dialog } = getTaskForm(page, 'Add task', 'Add');
        await expect(dialog).toBeVisible();
      });

      test('creates a task', async ({ page }) => {
        const { taskNameInputField, deadlineInputField, actionButton } = getTaskForm(
          page,
          'Add task',
          'Add',
        );

        // Fill in input fields with values.
        const deadline = '2099-12-31T09:00';
        const title = `${validTaskCreationData.title} ${Date.now()}`;
        await taskNameInputField.fill(title);
        await deadlineInputField.fill(deadline);

        // Submit the form.
        await actionButton.click();

        // Access the confirmation dialog.
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

        // Verify task exists.
        const task = page.getByRole('listitem').filter({ hasText: title });
        await expect(task).toBeVisible();
      });
      test('display an error for an empty task title', async ({ page }) => {
        const { dialog, actionButton } = getTaskForm(page, 'Add task', 'Add');

        // Submit the form.
        await actionButton.click();

        // Verify whether the error description is visible.
        const error = dialog.getByText('Title is required.', { exact: true });
        await expect(error).toBeVisible();

        // Verify whether dialog is still open.
        await expect(dialog).toBeVisible();

        // Verify whether no confirmation dialog shows.
        const confirmationDialog = page.getByRole('dialog', { name: 'Task created', exact: true });
        await expect(confirmationDialog).not.toBeVisible();
      });
    });
    // test('edits a task', () => {});
    // test('deletes a task', () => {});
  });
});
