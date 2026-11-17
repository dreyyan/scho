import type { Page } from '@playwright/test';

/**
 * Access a login Page's form elements.
 *
 * @param page - The page representing as the browser tab.
 * @returns The login form's locators.
 */
export const getLoginForm = (page: Page) => {
  return {
    emailInputField: page.getByLabel('Email'),
    passwordInputField: page.getByRole('textbox', {
      name: 'Password',
      exact: true,
    }),
    loginButton: page.getByRole('button', { name: 'Login' }),
  };
};
