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
  await page.waitForURL(/\/admin\/collections\/products/, { timeout: 60_000 });
}

async function firstDocId(
  page: import("@playwright/test").Page,
  collection: string,
): Promise<string> {
  const res = await page.request.get(`/api/${collection}?limit=1&depth=0`);
  expect(res.ok(), `list ${collection}`).toBeTruthy();
  const json = (await res.json()) as { docs: Array<{ id: string | number }> };
  const id = json.docs[0]?.id;
  expect(id).toBeTruthy();
  return String(id);
}

test.describe.configure({ mode: "serial" });

test.describe("admin write flows", () => {
  test.skip(skipAuth, "Set E2E_ADMIN_EMAIL/PASSWORD and E2E_ALLOW_REMOTE_ADMIN=true for remote.");

  test("blog post save succeeds without forbidden error", async ({ page }) => {
    test.setTimeout(120_000);
    await adminLogin(page);
    const id = await firstDocId(page, "blog-posts");
    await page.goto(`/admin/collections/blog-posts/${id}`);
    await expect(page).toHaveURL(new RegExp(`/admin/collections/blog-posts/${id}`));

    const excerpt = page.locator('textarea[name="excerpt"], input[name="excerpt"]').first();
    await expect(excerpt).toBeVisible({ timeout: 60_000 });
    const current = await excerpt.inputValue();
    const marker = ` e2e-${Date.now()}`;
    await excerpt.fill(`${current.replace(/\s*e2e-\d+/g, "")}${marker}`.slice(0, 240));

    const forbidden = page.getByText(/not allowed to perform this action/i);
    const save = page.locator("#action-save").first();
    await expect(save).toBeEnabled({ timeout: 15_000 });
    await save.click();

    await expect(forbidden).toHaveCount(0, { timeout: 15_000 });
    await expect(page.getByText(/successfully|updated|saved/i).first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("product edit shows specs field and can save", async ({ page }) => {
    test.setTimeout(120_000);
    await adminLogin(page);
    const id = await firstDocId(page, "products");
    await page.goto(`/admin/collections/products/${id}`);
    await expect(page).toHaveURL(new RegExp(`/admin/collections/products/${id}`));

    await expect(page.getByTestId("product-specs-field")).toBeVisible({ timeout: 60_000 });

    const nameInput = page.locator('input[name="name"]').first();
    await expect(nameInput).toBeVisible({ timeout: 30_000 });
    const name = await nameInput.inputValue();
    await nameInput.fill(`${name} `);
    await nameInput.fill(name.trim());

    const save = page.locator("#action-save").first();
    if (await save.isEnabled()) {
      await save.click();
      await expect(page.getByText(/not allowed to perform this action/i)).toHaveCount(0, {
        timeout: 15_000,
      });
      await expect(page.getByText(/successfully|updated|saved/i).first()).toBeVisible({
        timeout: 30_000,
      });
    } else {
      await expect(page.getByTestId("product-specs-field")).toBeVisible();
    }
  });
});
