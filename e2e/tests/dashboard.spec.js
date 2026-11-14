import { test, expect } from "@playwright/test";

test.describe("Dashboard page", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("http://localhost:3000/login");
    await page.getByLabel("email").fill("sarah.johnson@hospital.com");
    await page.getByLabel("password").fill("Handover2026!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL("http://localhost:3000/");
  });
  test("A user can click on a unit and be taken to that unit's page", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Cardiology" }).click();
    await expect(page).toHaveURL("http://localhost:3000/units/1");
    await expect(
      page.getByRole("heading", { name: "Cardiology" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "John Smith" })).toBeVisible();
  });
});
