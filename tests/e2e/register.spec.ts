import { test, expect } from "@playwright/test";

test("should display the registration page", async ({ page }) => {
  await page.goto(`/register`);

  /* Valid URLs:
    http://localhost:3000/register
    http://localhost:3000/register/
  */
  await expect(page).toHaveURL(/\/register\/?$/);
});