import { test as setup, expect } from '@playwright/test';
import { generateRandomEmail } from '../helpers/generateRandomEmail';
import { validLoginData } from '../fixtures/auth';
import { AUTH_FILE } from './constants';
import { getLoginForm } from '../helpers/getLoginForm';

const testLoginData = {
  ...validLoginData,
  email: generateRandomEmail('setup'),
};

setup('authenticate', async ({ page, request }) => {
  // 1. Register a test user.
  const response = await request.post('/api/auth/register', {
    data: {
      ...testLoginData,
      confirmPassword: testLoginData.password,
    },
  });

  expect(response.status()).toBe(201);

  // 2. Login through the UI.
  await page.goto('/login');

  // Wait for React hydration before interacting with the form.
  await expect(page.locator('form')).toHaveAttribute('data-hydrated', 'true');

  const { emailInputField, passwordInputField, loginButton } = getLoginForm(page);

  await emailInputField.fill(testLoginData.email);
  await passwordInputField.fill(testLoginData.password);

  await loginButton.click();

  await expect(page).toHaveURL(/\/dashboard\/?$/);

  // 3. Save storage state.
  await page.context().storageState({ path: AUTH_FILE });
});
