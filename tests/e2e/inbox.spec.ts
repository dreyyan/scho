import { test, expect } from '@playwright/test';
import { validInboxItemCreationData } from '../fixtures/inbox';
import { getInboxItemForm } from '../helpers/inbox/getInboxItemForm';
import { createInboxItem } from '../helpers/inbox/createInboxItem';
import { getTaskForm } from '../helpers/task/getTaskForm';

const INBOX_URL = '/inbox';

test.describe('Inbox', () => {
  const errors = [
    {
      case: 'empty content',
      message: 'Content is required.',
      content: '',
    },
    {
      case: 'whitespace content',
      message: 'Content is required.',
      content: ' ',
    },
    {
      case: 'overlong content',
      message: 'Content must not exceed 2000 characters.',
      content: 'a'.repeat(2001),
    },
  ];
  test.describe('when logged out', () => {
    // Start logged out: the config loads a saved session for every test by default.
    test.use({ storageState: { cookies: [], origins: [] } });

    test('redirects to the login page', async ({ page }) => {
      await page.goto(INBOX_URL);

      await expect(page).toHaveURL(/\/login\/?$/);
    });
  });

  test.describe('when logged in', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to 'Inbox' page.
      await page.goto(INBOX_URL);
      await expect(page.getByRole('heading', { name: 'Inbox', exact: true })).toBeVisible();
    });
    test.describe("when the 'Add inbox' dialog is open", () => {
      test.beforeEach(async ({ page }) => {
        // Click the 'Add inbox' button.
        const addInboxItemButton = page.getByRole('button', {
          name: 'Add inbox item',
          exact: true,
        });
        await addInboxItemButton.click();

        const { dialog } = getInboxItemForm(page, 'Add inbox item', 'Add');
        await expect(dialog).toBeVisible();
      });

      test('creates an inbox item', async ({ page }) => {
        const { contentInputField, actionButton } = getInboxItemForm(page, 'Add inbox item', 'Add');

        // Fill in input fields with values.
        const content = `${validInboxItemCreationData.content} ${crypto.randomUUID()}`;
        await contentInputField.fill(content);

        // Submit the form.
        await actionButton.click();

        // Access the confirmation dialog.
        const confirmationDialog = page.getByRole('dialog', {
          name: 'Inbox item created',
          exact: true,
        });
        await expect(confirmationDialog).toBeVisible();

        // Close the modal.
        const confirmationPrimaryButton = confirmationDialog.getByRole('button', {
          name: 'Got it',
          exact: true,
        });
        await confirmationPrimaryButton.click();

        // Confirm that confirmation modal closed.
        await expect(confirmationDialog).not.toBeVisible();

        // Verify inbox item exists.
        const inboxItem = page.getByRole('listitem').filter({ hasText: content });
        await expect(inboxItem).toBeVisible();
      });
      for (const error of errors) {
        test(`displays an error for ${error.case}`, async ({ page }) => {
          const { dialog, contentInputField, actionButton } = getInboxItemForm(
            page,
            'Add inbox item',
            'Add',
          );

          // Fill in input field with value.
          await contentInputField.fill(error.content);

          // Submit the form.
          await actionButton.click();

          // Verify whether the error description is visible.
          const errMsg = dialog.getByText(error.message, { exact: true });
          await expect(errMsg).toBeVisible();

          // Verify whether dialog is still open.
          await expect(dialog).toBeVisible();

          // Verify whether no confirmation dialog shows.
          const confirmationDialog = page.getByRole('dialog', {
            name: 'Inbox item created',
            exact: true,
          });
          await expect(confirmationDialog).not.toBeVisible();
        });
      }
    });
    test.describe("when the 'View inbox item' dialog is open", () => {
      let content: string;
      test.beforeEach(async ({ page }) => {
        // Create an inbox item before testing inbox item viewing.
        content = `${validInboxItemCreationData.content} ${crypto.randomUUID()}`;
        await createInboxItem(page.request, content);

        // Reload the page to make the new inbox item appear.
        await page.reload();

        // Click the 'View' button for this inbox item.
        const viewInboxItemButton = page.getByRole('button', { name: `View ${content}` });
        await viewInboxItemButton.click();

        const dialog = page.getByRole('dialog', { name: 'View inbox item', exact: true });
        await expect(dialog).toBeVisible();
      });
      test("the inbox item's content is displayed", async ({ page }) => {
        const dialog = page.getByRole('dialog', { name: 'View inbox item', exact: true });
        await expect(dialog).toBeVisible();

        const contentText = dialog.getByText(content, { exact: true });
        await expect(contentText).toBeVisible();
      });
      test('the dialog can be closed', async ({ page }) => {
        const dialog = page.getByRole('dialog', { name: 'View inbox item', exact: true });
        await expect(dialog).toBeVisible();

        // Close the inbox item dialog.
        const closeButton = dialog.getByRole('button', { name: 'Close', exact: true });
        await closeButton.click();

        await expect(dialog).not.toBeVisible();
      });
    });
    test.describe('when viewing a link inbox item', () => {
      let url: string;
      test.beforeEach(async ({ page }) => {
        url = `https://example.com/${crypto.randomUUID()}`;

        // Create an inbox item before testing inbox item link viewing.
        await createInboxItem(page.request, url);

        // Reload the page to make the new inbox item appear.
        await page.reload();

        // Click the 'View' button for this inbox item.
        const viewInboxItemButton = page.getByRole('button', { name: `View ${url}` });
        await viewInboxItemButton.click();

        const dialog = page.getByRole('dialog', { name: 'View inbox item', exact: true });
        await expect(dialog).toBeVisible();
      });
      test("an 'Open link' link is displayed", async ({ page }) => {
        const dialog = page.getByRole('dialog', { name: 'View inbox item', exact: true });
        await expect(dialog).toBeVisible();

        const openLinkURL = dialog.getByRole('link', { name: 'Open link', exact: true });
        await expect(openLinkURL).toHaveAttribute('href', url);
      });
    });
    test.describe("when the 'Edit inbox item' dialog is open", () => {
      test.beforeEach(async ({ page }) => {
        // Create an inbox item before testing inbox item edit.
        const content = `${validInboxItemCreationData.content} ${crypto.randomUUID()}`;
        await createInboxItem(page.request, content);

        // Reload the page to make the new inbox item appear.
        await page.reload();

        // Click the 'Edit inbox item' button.
        const editInboxItemButton = page.getByRole('button', { name: `Edit ${content}` });
        await editInboxItemButton.click();

        const { dialog } = getInboxItemForm(page, 'Edit inbox item', 'Edit');
        await expect(dialog).toBeVisible();
      });

      test('edits an inbox item', async ({ page }) => {
        const { contentInputField, actionButton } = getInboxItemForm(
          page,
          'Edit inbox item',
          'Edit',
        );

        // Fill input fields with valid values.
        const content = `Edited inbox item content ${crypto.randomUUID()}`;
        await contentInputField.fill(content);

        // Save edit changes.
        await actionButton.click();

        // Access the confirmation dialog.
        const confirmationDialog = page.getByRole('dialog', {
          name: 'Inbox item updated',
          exact: true,
        });
        await expect(confirmationDialog).toBeVisible();

        // Close the modal.
        const confirmationPrimaryButton = confirmationDialog.getByRole('button', {
          name: 'Got it',
          exact: true,
        });
        await confirmationPrimaryButton.click();

        // Confirm that confirmation modal closed.
        await expect(confirmationDialog).not.toBeVisible();

        // Verify inbox item was edited.
        const inboxItem = page.getByRole('listitem').filter({ hasText: content });
        await expect(inboxItem).toBeVisible();
      });
      for (const error of errors) {
        test(`displays an error for ${error.case}`, async ({ page }) => {
          const { dialog, contentInputField, actionButton } = getInboxItemForm(
            page,
            'Edit inbox item',
            'Edit',
          );

          // Fill in input field with value.
          await contentInputField.fill(error.content);

          // Submit the form.
          await actionButton.click();

          // Verify whether the error description is visible.
          const errMsg = dialog.getByText(error.message, { exact: true });
          await expect(errMsg).toBeVisible();

          // Verify whether dialog is still open.
          await expect(dialog).toBeVisible();

          // Verify whether no confirmation dialog shows.
          const confirmationDialog = page.getByRole('dialog', {
            name: 'Inbox item updated',
            exact: true,
          });
          await expect(confirmationDialog).not.toBeVisible();
        });
      }
    });

    test.describe("when the 'Convert inbox item' dialog is open", () => {
      let content: string;
      test.beforeEach(async ({ page }) => {
        // Create an inbox item before testing inbox item conversion.
        content = `${validInboxItemCreationData.content} ${crypto.randomUUID()}`;
        await createInboxItem(page.request, content);

        // Reload the page to make the new inbox item appear.
        await page.reload();

        // Click the 'Convert inbox item' button.
        const convertInboxItemButton = page.getByRole('button', {
          name: `Convert ${content} to task`,
        });
        await convertInboxItemButton.click();

        const { dialog } = getTaskForm(page, 'Convert inbox item', 'Convert');
        await expect(dialog).toBeVisible();
      });

      test("the task name is pre-filled with the inbox item's content", async ({ page }) => {
        const { taskNameInputField } = getTaskForm(page, 'Convert inbox item', 'Convert');

        await expect(taskNameInputField).toHaveValue(content);
      });

      test('converts an inbox item to a task', async ({ page }) => {
        const { actionButton } = getTaskForm(page, 'Convert inbox item', 'Convert');

        // Submit the form.
        await actionButton.click();

        // Verify whether a confirmation dialog shows.
        const confirmationDialog = page.getByRole('dialog', {
          name: 'Inbox item converted',
          exact: true,
        });
        await expect(confirmationDialog).toBeVisible();

        // Close the confirmation dialog.
        const closeButton = confirmationDialog.getByRole('button', { name: 'Got it', exact: true });
        await closeButton.click();

        // Verify whether inbox item was converted to task via absence of conversion button.
        await expect(confirmationDialog).not.toBeVisible();
        await expect(page.getByRole('button', { name: `Convert ${content} to task` })).toHaveCount(
          0,
        );
      });

      test("the 'Convert' button stays hidden after a reload", async ({ page }) => {
        const { actionButton } = getTaskForm(page, 'Convert inbox item', 'Convert');

        // Submit the form.
        await actionButton.click();

        // Verify whether a confirmation dialog shows.
        const confirmationDialog = page.getByRole('dialog', {
          name: 'Inbox item converted',
          exact: true,
        });
        await expect(confirmationDialog).toBeVisible();

        // Close the confirmation dialog.
        const closeButton = confirmationDialog.getByRole('button', { name: 'Got it', exact: true });
        await closeButton.click();

        await page.reload();

        // Converted items are hidden from the default 'Unprocessed' view.
        await page.getByRole('combobox', { name: 'Filter tasks' }).click();
        await page.getByRole('option', { name: 'Converted', exact: true }).click();

        await expect(page.getByRole('listitem').filter({ hasText: content })).toBeVisible();

        // Verify whether inbox item was converted to task via absence of conversion button.
        await expect(confirmationDialog).not.toBeVisible();
        await expect(page.getByRole('button', { name: `Convert ${content} to task` })).toHaveCount(
          0,
        );
      });

      test("the converted task appears on the 'Tasks' page", async ({ page }) => {});

      test('displays an error for an empty task name', async ({ page }) => {});
    });

    test.describe("when the 'Delete inbox item' dialog is open", () => {
      let content: string;
      test.beforeEach(async ({ page }) => {
        content = `${validInboxItemCreationData.content} ${crypto.randomUUID()}`; // Create an inbox item before testing inbox item deletion.
        await createInboxItem(page.request, content);

        // Reload the page to make the new inbox item appear.
        await page.reload();

        // Click the 'Delete inbox item' button.
        const deleteInboxItemButton = page.getByRole('button', { name: `Delete ${content}` });
        await deleteInboxItemButton.click();

        const { dialog } = getInboxItemForm(page, 'Delete inbox item', 'Delete');
        await expect(dialog).toBeVisible();
      });
      test('deletes an inbox item', async ({ page }) => {
        const { actionButton } = getInboxItemForm(page, 'Delete inbox item', 'Delete');

        // Verify that inbox item exists before deleting.
        let inboxItem = page.getByRole('listitem').filter({ hasText: content });
        await expect(inboxItem).toBeVisible();

        // Delete the inbox item.
        await actionButton.click();

        // Verify inbox item was deleted.
        inboxItem = page.getByRole('listitem').filter({ hasText: content });
        await expect(inboxItem).not.toBeVisible();
      });
    });
  });
});
