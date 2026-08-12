import { expect, test } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "";
const allowRemoteAdmin = process.env.E2E_ALLOW_REMOTE_ADMIN === "true";

test("admin login page renders", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByText(/Login/i)).toBeVisible();
});

test.skip(
  !adminEmail ||
    !adminPassword ||
    (baseURL.startsWith("http") && !baseURL.includes("127.0.0.1") && !allowRemoteAdmin),
  "Set admin creds and explicitly allow remote admin login with E2E_ALLOW_REMOTE_ADMIN=true.",
);

test("admin redirects into products after login", async ({ page }) => {
  await page.goto("/admin/login");

  const emailInput = page.locator(
    'input[name="email"], input[name="login"], input[type="email"]',
  );
  await emailInput.first().fill(adminEmail!);
  await page.locator('input[name="password"], input[type="password"]').first().fill(
    adminPassword!,
  );
  await page.getByRole("button", { name: /login/i }).click();

  await page.waitForURL(/\/admin\/collections\/products/);
  await expect(page).toHaveURL(/\/admin\/collections\/products/);
  await expect(page.getByPlaceholder(/Search by Name/i)).toBeVisible({ timeout: 30_000 });
});
