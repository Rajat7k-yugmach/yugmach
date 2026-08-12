import path from "path";
import { expect, test } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "";
const allowRemoteAdmin = process.env.E2E_ALLOW_REMOTE_ADMIN === "true";
const fixture = path.join(__dirname, "fixtures", "test-upload.png");

const skipAuth =
  !adminEmail ||
  !adminPassword ||
  (baseURL.startsWith("http") && !baseURL.includes("127.0.0.1") && !allowRemoteAdmin);

async function adminLogin(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  const emailInput = page.locator(
    'input[name="email"], input[name="login"], input[type="email"]',
  );
  await emailInput.first().fill(adminEmail!);
  await page.locator('input[name="password"], input[type="password"]').first().fill(adminPassword!);
  await page.getByRole("button", { name: /login/i }).click();
  await page.waitForURL(/\/admin\/collections\/products/);
}

test.describe("admin media upload", () => {
  test.skip(skipAuth, "Set E2E_ADMIN_EMAIL/PASSWORD and E2E_ALLOW_REMOTE_ADMIN=true for remote.");

  test("media create page accepts an image upload without failed-to-fetch", async ({ page }) => {
    await adminLogin(page);
    await page.goto("/admin/collections/media/create");

    await expect(page.getByText(/Creating new Media|Create New/i).first()).toBeVisible({
      timeout: 30_000,
    });

    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached({ timeout: 15_000 });
    await fileInput.setInputFiles(fixture);

    const alt = page.locator('input[name="alt"]');
    await alt.fill(`E2E upload ${Date.now()}`);

    const failedFetch = page.getByText(/Failed to fetch/i);
    const forbidden = page.getByText(/not allowed to perform this action/i);

    await page.getByRole("button", { name: /^save$/i }).click();

    await expect(failedFetch).toHaveCount(0, { timeout: 30_000 });
    await expect(forbidden).toHaveCount(0, { timeout: 5_000 });
    await expect(page.getByText(/successfully|created|saved/i).first()).toBeVisible({
      timeout: 45_000,
    });
  });

  test("product images section has add image control", async ({ page }) => {
    await adminLogin(page);
    await page.goto("/admin/collections/products");
    const firstRow = page.locator("table tbody tr a, .collection-list a").first();
    await firstRow.click();
    await page.waitForURL(/\/admin\/collections\/products\/\w+/);

    await expect(page.getByRole("button", { name: /add image/i }).first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
