import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Unit page", () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("http://localhost:3000/units/1");
  });

  test("Searching by name filters patients and is case-insensitive", async ({
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
  test("Searching for a patient from another unit shows the no-results message", async ({
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
  test("Searching by bed number shows only the matching patient", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder(
      "Search by name or bed number...",
    );
    await expect(page.getByRole("link", { name: "John Smith" })).toBeVisible();
    await searchInput.fill("c-4");
    await expect(
      page.getByRole("link", { name: "John Smith" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "James Anderson" }),
    ).toBeVisible();
  });
});
