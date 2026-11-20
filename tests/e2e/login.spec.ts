import { test, expect } from '@playwright/test';
import { validLoginData } from '../fixtures/auth';
import { generateRandomEmail } from '../helpers/generateRandomEmail';
import { getLoginForm } from '../helpers/getLoginForm';

const testLoginData = {
  ...validLoginData,
  email: generateRandomEmail('login'),
};

test.describe('Login', () => {
  // Start logged out: the config loads a saved session for every test by default.
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeAll(async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: {
        ...testLoginData,
        confirmPassword: testLoginData.password,
      },
    });

    expect(response.status()).toBe(201);
  });

  test('display the login form', async ({ page }) => {
    await page.goto('/login');

    /* Valid URLs:
      http://localhost:3000/login
      http://localhost:3000/login/
    */
    await expect(page).toHaveURL(/\/login\/?$/);

    const { emailInputField, passwordInputField, loginButton } = getLoginForm(page);

    await expect(emailInputField).toBeVisible();
    await expect(passwordInputField).toBeVisible();
    await expect(loginButton).toBeVisible();
  });

  test('successfully login user', async ({ page }) => {
    await page.goto('/login');

    // Wait for React hydration before interacting with the form.
    await expect(page.locator('form')).toHaveAttribute('data-hydrated', 'true');

    const { emailInputField, passwordInputField, loginButton } = getLoginForm(page);

    await emailInputField.fill(testLoginData.email);
    await passwordInputField.fill(testLoginData.password);

    await loginButton.click();

    await expect(page).toHaveURL(/\/dashboard\/?$/);
  });

  test.afterAll(async () => {
    // TODO: Implement user deletion API.
  });
});
