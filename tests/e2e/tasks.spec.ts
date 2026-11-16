import { test, expect } from '@playwright/test';

test.describe('Tasks', () => {
  test.describe('when logged out', () => {
    // Start logged out: the config loads a saved session for every test by default.
    test.use({ storageState: { cookies: [], origins: [] } });

    test('redirects to the login page', async ({ page }) => {
      await page.goto('/tasks');

      await expect(page).toHaveURL(/\/login\/?$/);
    });
  });
});
