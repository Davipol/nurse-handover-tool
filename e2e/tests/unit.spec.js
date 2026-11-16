import { test, expect } from "@playwright/test";

async function login(page) {
  await page.goto("http://localhost:3000/login");
  await page.getByLabel("email").fill("sarah.johnson@hospital.com");
  await page.getByLabel("password").fill("Handover2026!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL("http://localhost:3000/");
}

test.describe("Unit page", () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("http://localhost:3000/units/1");
  });

  test("The search bar is present and patients are filtered correctly by typing", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder(
      "Search by name or bed number...",
    );
    await expect(searchInput).toBeVisible();
    await expect(page.getByRole("link", { name: "John Smith" })).toBeVisible();
    await searchInput.fill("marti");
    await expect(
      page.getByRole("link", { name: "William Martinez" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "John Smith" }),
    ).not.toBeVisible();
  });
  test("Writing a patient from a different ward in the search input does not show patients", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder(
      "Search by name or bed number...",
    );
    await expect(page.getByRole("link", { name: "John Smith" })).toBeVisible();
    await searchInput.fill("williams");
    await expect(
      page.getByRole("link", { name: "John Smith" }),
    ).not.toBeVisible();
    await expect(page.getByText("No patients match your search")).toBeVisible();
  });
});
