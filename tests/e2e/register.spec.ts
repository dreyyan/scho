import { test, expect, type Page } from "@playwright/test";
import { invalidAuthData, validRegistrationData } from "../fixtures/auth";

const getRegistrationForm = (page: Page) => {
  return {
    emailInputField: page.getByLabel("Email"),
    // Match only the Password field, excluding Confirm Password and visibility buttons.
    passwordInputField: page.getByLabel("Password", { exact: true }),
    confirmPasswordInputField: page.getByLabel("Confirm Password"),
    registerButton: page.getByRole("button", { name: "Create Account" }),
  };
};

test.describe("Registration", () => {
  test("display the registration form", async ({ page }) => {
    await page.goto(`/register`);

    /* Valid URLs:
      http://localhost:3000/register
      http://localhost:3000/register/
    */
    await expect(page).toHaveURL(/\/register\/?$/);

    const {
      emailInputField,
      passwordInputField,
      confirmPasswordInputField,
      registerButton
    } = getRegistrationForm(page);

    await expect(emailInputField).toBeVisible();
    await expect(passwordInputField).toBeVisible();
    await expect(confirmPasswordInputField).toBeVisible();
    await expect(registerButton).toBeVisible();
  });

  test("successfully register a new user", async ({ page }) => {
    await page.goto(`/register`);

    // Wait for React hydration before interacting with the form.
    await expect(page.locator("form")).toHaveAttribute(
      "data-hydrated",
      "true"
    );

    // Generate a unique email for each test run.
    const uniqueEmail = `test-${crypto.randomUUID()}@example.com`;

    const {
      emailInputField,
      passwordInputField,
      confirmPasswordInputField,
      registerButton,
    } = getRegistrationForm(page);

    await emailInputField.fill(uniqueEmail);
    await passwordInputField.fill(validRegistrationData.password);
    await confirmPasswordInputField.fill(validRegistrationData.confirmPassword);

    await registerButton.click();

    await expect(page.getByText("Registration Successful")).toBeVisible();
  });

  test("display errors for empty required fields", async ({ page }) => {
    await page.goto("/register");

    await expect(page.locator("form")).toHaveAttribute(
      "data-hydrated",
      "true"
    );

    const {
      emailInputField,
      passwordInputField,
      confirmPasswordInputField,
      registerButton,
    } = getRegistrationForm(page);

    await registerButton.click();

    for (const inputField of [
      emailInputField,
      passwordInputField,
      confirmPasswordInputField,
    ]) {
      await expect(inputField).toHaveJSProperty("required", true);

      const valueMissing = await inputField.evaluate(
        (input: HTMLInputElement) => input.validity.valueMissing
      );

      expect(valueMissing).toBe(true);
    }
  });

  test("display an error for an invalid email", async ({ page }) => {
    await page.goto(`/register`);

    // Wait for React hydration before interacting with the form.
    await expect(page.locator("form")).toHaveAttribute(
      "data-hydrated",
      "true"
    );

    const { email, password, confirmPassword } = invalidAuthData.registration.invalidEmail;

    const {
      emailInputField,
      passwordInputField,
      confirmPasswordInputField,
      registerButton,
    } = getRegistrationForm(page);

    await emailInputField.fill(email);
    await passwordInputField.fill(password);
    await confirmPasswordInputField.fill(confirmPassword);

    await registerButton.click();

    const isValid = await emailInputField.evaluate(
      (input: HTMLInputElement) => input.checkValidity()
    );

    expect(isValid).toBe(false);
  });

  test("display an error for an existing email", async ({ page }) => {
    await page.goto(`/register`);

    // Wait for React hydration before interacting with the form.
    await expect(page.locator("form")).toHaveAttribute(
      "data-hydrated",
      "true"
    );

    // Generate a unique email for each test run.
    const uniqueEmail = `test-${crypto.randomUUID()}@example.com`;

    const { password, confirmPassword } = validRegistrationData;

    const {
      emailInputField,
      passwordInputField,
      confirmPasswordInputField,
      registerButton,
    } = getRegistrationForm(page);

    await emailInputField.fill(uniqueEmail);
    await passwordInputField.fill(password);
    await confirmPasswordInputField.fill(confirmPassword);

    await registerButton.click();

    await expect(page.getByText("Registration Successful")).toBeVisible();

    await page.reload();

    // Wait for React hydration before interacting with the form.
    await expect(page.locator("form")).toHaveAttribute(
      "data-hydrated",
      "true"
    );

    await emailInputField.fill(uniqueEmail);
    await passwordInputField.fill(password);
    await confirmPasswordInputField.fill(confirmPassword);

    await registerButton.click();

    await expect(page.getByText("Email is already registered.")).toBeVisible();
  });

  test("display password requirement errors", async ({ page }) => {
    await page.goto(`/register`);

  });

  test("display an error when passwords do not match", async ({ page }) => {
    await page.goto(`/register`);

    const { email, password, confirmPassword } = invalidAuthData.registration.mismatchedPasswords;

    const {
      emailInputField,
      passwordInputField,
      confirmPasswordInputField,
      registerButton,
    } = getRegistrationForm(page);

    await emailInputField.fill(email);
    await passwordInputField.fill(password);
    await confirmPasswordInputField.fill(confirmPassword);

    await registerButton.click();

    await expect(page.getByText("Passwords do not match.")).toBeVisible();
  });
});