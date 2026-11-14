import { test, expect } from "@playwright/test";

test.describe("User Menu", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("http://localhost:3000/login");
    await page.getByLabel("email").fill("sarah.johnson@hospital.com");
    await page.getByLabel("password").fill("Handover2026!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL("http://localhost:3000/");
  });
  test("User menu allows user to sign out correctly", async ({ page }) => {
    await expect(page.getByRole("button", { name: "User menu" })).toBeVisible();
    await expect(page.getByText("Sarah Johnson")).not.toBeVisible();
    await page.getByRole("button", { name: "User menu" }).click();
    await expect(page.getByText("Sarah Johnson")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("http://localhost:3000/login");

    // Prove the session is really gone: visiting a protected page
    // should send user back to the login page
    await page.goto("http://localhost:3000/");
    await expect(page).toHaveURL("http://localhost:3000/login");
  });
});
