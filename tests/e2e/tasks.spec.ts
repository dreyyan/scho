import { test, expect } from '@playwright/test';
import { validTaskCreationData } from '../fixtures/task';
import { getTaskForm } from '../helpers/getTaskForm';
import { createTask } from '../helpers/createTask';

test.describe('Tasks', () => {
  const errors = [
    {
      case: 'empty task title',
      message: 'Title is required.',
      taskName: '',
    },
    {
      case: 'whitespace task title',
      message: 'Title is required.',
      taskName: ' ',
    },
    {
      case: 'overlong title',
      message: 'Title must not exceed 150 characters.',
      taskName: 'a'.repeat(151),
    },
  ];
  test.describe('when logged out', () => {
    // Start logged out: the config loads a saved session for every test by default.
    test.use({ storageState: { cookies: [], origins: [] } });

    test('redirects to the login page', async ({ page }) => {
      await page.goto('/tasks');

      await expect(page).toHaveURL(/\/login\/?$/);
    });
  });

  test.describe('when logged in', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to 'Tasks' page.
      await page.goto('/tasks');
      await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible();
    });
    test.describe("when the 'Add task' dialog is open", () => {
      test.beforeEach(async ({ page }) => {
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
        const title = `${validTaskCreationData.title} ${crypto.randomUUID()}`;
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
      for (const error of errors) {
        test(`displays an error for ${error.case}`, async ({ page }) => {
          const { dialog, taskNameInputField, actionButton } = getTaskForm(page, 'Add task', 'Add');

          // Fill in input field with value.
          await taskNameInputField.fill(error.taskName);

          // Submit the form.
          await actionButton.click();

          // Verify whether the error description is visible.
          const errMsg = dialog.getByText(error.message, { exact: true });
          await expect(errMsg).toBeVisible();

          // Verify whether dialog is still open.
          await expect(dialog).toBeVisible();

          // Verify whether no confirmation dialog shows.
          const confirmationDialog = page.getByRole('dialog', {
            name: 'Task created',
            exact: true,
          });
          await expect(confirmationDialog).not.toBeVisible();
        });
      }
    });
    test.describe('when marking a task as completed', () => {
      let title: string;
      test.beforeEach(async ({ page }) => {
        // Create a task before testing task completion.
        title = `${validTaskCreationData.title} ${crypto.randomUUID()}`;
        await createTask(page.request, title);

        // Reload the page to make the new task appear.
        await page.reload();
      });
      test('marks a task as complete', async ({ page }) => {
        const isCompletedCheckbox = page.getByRole('checkbox', { name: `Complete ${title}` });

        // Verify whether checkbox is marked incomplete before testing for completeness.
        await expect(isCompletedCheckbox).not.toBeChecked();

        // Start waiting for the save request before clicking.
        const responsePromise = page.waitForResponse(
          (res) => res.url().includes('/api/tasks') && res.request().method() === 'PATCH',
        );

        // Mark the checkbox as complete.
        await isCompletedCheckbox.click();

        // Wait for the save request to finish.
        const response = await responsePromise;
        expect(response.ok()).toBe(true);

        // Verify whether checkbox was marked as completed.
        await expect(isCompletedCheckbox).not.toBeVisible();

        // Reload, switch to 'Completed' status panel, and verify the change was saved.
        await page.reload();
        await page.getByRole('button', { name: 'Completed', exact: true }).click();
        await expect(isCompletedCheckbox).toBeChecked();
      });
    });
    test.describe("when the 'Edit task' dialog is open", () => {
      test.beforeEach(async ({ page }) => {
        // Create a task before testing task edit.
        const title = `${validTaskCreationData.title} ${crypto.randomUUID()}`;
        await createTask(page.request, title);

        // Reload the page to make the new task appear.
        await page.reload();

        // Click the 'Edit task' button.
        const editTaskButton = page.getByRole('button', { name: `Edit ${title}` });
        await editTaskButton.click();

        const { dialog } = getTaskForm(page, 'Edit task', 'Edit');
        await expect(dialog).toBeVisible();
      });

      test('edits a task', async ({ page }) => {
        const { taskNameInputField, deadlineInputField, actionButton } = getTaskForm(
          page,
          'Edit task',
          'Edit',
        );

        // Fill input fields with valid values.
        const title = `Edited task name ${crypto.randomUUID()}`;
        const deadline = '2099-12-31T09:00';
        await taskNameInputField.fill(title);
        await deadlineInputField.fill(deadline);

        // Save edit changes.
        await actionButton.click();

        // Access the confirmation dialog.
        const confirmationDialog = page.getByRole('dialog', { name: 'Task updated', exact: true });
        await expect(confirmationDialog).toBeVisible();

        // Close the modal.
        const confirmationPrimaryButton = confirmationDialog.getByRole('button', {
          name: 'Got it',
          exact: true,
        });
        await confirmationPrimaryButton.click();

        // Confirm that confirmation modal closed.
        await expect(confirmationDialog).not.toBeVisible();

        // Verify task was edited.
        const task = page.getByRole('listitem').filter({ hasText: title });
        await expect(task).toBeVisible();
      });
      for (const error of errors) {
        test(`displays an error for ${error.case}`, async ({ page }) => {
          const { dialog, taskNameInputField, actionButton } = getTaskForm(
            page,
            'Edit task',
            'Edit',
          );

          // Fill in input field with value.
          await taskNameInputField.fill(error.taskName);

          // Submit the form.
          await actionButton.click();

          // Verify whether the error description is visible.
          const errMsg = dialog.getByText(error.message, { exact: true });
          await expect(errMsg).toBeVisible();

          // Verify whether dialog is still open.
          await expect(dialog).toBeVisible();

          // Verify whether no confirmation dialog shows.
          const confirmationDialog = page.getByRole('dialog', {
            name: 'Task updated',
            exact: true,
          });
          await expect(confirmationDialog).not.toBeVisible();
        });
      }
    });
    test.describe("when the 'Delete task' dialog is open", () => {
      let title: string;
      test.beforeEach(async ({ page }) => {
        title = `${validTaskCreationData.title} ${crypto.randomUUID()}`; // Create a task before testing task deletion.
        await createTask(page.request, title);

        // Reload the page to make the new task appear.
        await page.reload();

        // Click the 'Delete task' button.
        const deleteTaskButton = page.getByRole('button', { name: `Delete ${title}` });
        await deleteTaskButton.click();

        const { dialog } = getTaskForm(page, 'Delete task', 'Delete');
        await expect(dialog).toBeVisible();
      });
      test('deletes a task', async ({ page }) => {
        const { actionButton } = getTaskForm(page, 'Delete task', 'Delete');

        // Verify that task exists before deleting.
        let task = page.getByRole('listitem').filter({ hasText: title });
        await expect(task).toBeVisible();

        // Delete the task.
        await actionButton.click();

        // Verify task was deleted.
        task = page.getByRole('listitem').filter({ hasText: title });
        await expect(task).not.toBeVisible();
      });
    });
  });
});
