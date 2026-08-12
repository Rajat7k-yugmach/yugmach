import { expect, test } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "";
const allowRemoteAdmin = process.env.E2E_ALLOW_REMOTE_ADMIN === "true";

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

test.describe("admin write flows", () => {
  test.skip(skipAuth, "Set E2E_ADMIN_EMAIL/PASSWORD and E2E_ALLOW_REMOTE_ADMIN=true for remote.");

  test("blog post save succeeds without forbidden error", async ({ page }) => {
    await adminLogin(page);
    await page.goto("/admin/collections/blog-posts");
    await expect(page.getByRole("heading", { name: /Blog Posts/i })).toBeVisible({
      timeout: 30_000,
    });

    const firstRow = page.locator("table tbody tr a, .collection-list a").first();
    await firstRow.click();
    await page.waitForURL(/\/admin\/collections\/blog-posts\/\w+/);

    const excerpt = page.locator('textarea[name="excerpt"], input[name="excerpt"]').first();
    if (await excerpt.count()) {
      const current = await excerpt.inputValue();
      const marker = ` e2e-${Date.now()}`;
      await excerpt.fill(`${current.replace(/\s*e2e-\d+/g, "")}${marker}`.slice(0, 240));
    }

    const forbidden = page.getByText(/not allowed to perform this action/i);
    await page.getByRole("button", { name: /^save$/i }).click();

    await expect(forbidden).toHaveCount(0, { timeout: 15_000 });
    await expect(page.getByText(/successfully|updated|saved/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test("product edit shows specs field and can save", async ({ page }) => {
    await adminLogin(page);
    await page.goto("/admin/collections/products");
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible({
      timeout: 30_000,
    });

    const firstRow = page.locator("table tbody tr a, .collection-list a").first();
    await firstRow.click();
    await page.waitForURL(/\/admin\/collections\/products\/\w+/);

    await expect(page.getByTestId("product-specs-field")).toBeVisible({ timeout: 30_000 });

    // Live preview controls exist in Payload toolbar when configured
    const previewToggle = page.getByRole("button", { name: /live preview|preview/i });
    if (await previewToggle.count()) {
      await expect(previewToggle.first()).toBeVisible();
    }

    await page.getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByText(/not allowed to perform this action/i)).toHaveCount(0, {
      timeout: 15_000,
    });
    await expect(page.getByText(/successfully|updated|saved/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});
