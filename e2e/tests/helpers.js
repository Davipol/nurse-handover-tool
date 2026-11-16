import { expect } from "@playwright/test";

// Login function
export async function login(page) {
  await page.goto("http://localhost:3000/login");
  await page.getByLabel("email").fill("sarah.johnson@hospital.com");
  await page.getByLabel("password").fill("Handover2026!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL("http://localhost:3000/");
}
