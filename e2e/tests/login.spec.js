// @ts-check
import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("Login page has title", async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("Email and password fields are present", async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    await expect(page.getByLabel("email")).toBeVisible();
    await expect(page.getByLabel("password")).toBeVisible();
  });

  test("A nurse is able to login using correct email and password and they are sent to the home page", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/login");
    await page.getByLabel("email").fill("sarah.johnson@hospital.com");
    await page.getByLabel("password").fill("Handover2026!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL("http://localhost:3000/");
    await expect(page.getByRole("heading", { name: "Units" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Cardiology" })).toBeVisible();
  });
});
