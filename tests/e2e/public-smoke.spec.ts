import { expect, test } from "@playwright/test";

test("homepage renders core conversion controls", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Packing machines for/i,
  );
  await expect(page.getByTestId("machine-finder-form")).toBeVisible();
  await expect(page.getByTestId("machine-finder-continue")).toBeVisible();
  await expect(page.getByTestId("machine-finder-advisor-link")).toBeVisible();
});

test("products listing and filter controls render", async ({ page }) => {
  await page.goto("/products");

  await expect(
    page.getByRole("heading", { name: /All packing machines/i }),
  ).toBeVisible();
  await expect(page.getByTestId("products-filter-form")).toBeVisible();
  await expect(page.getByTestId("products-filter-application")).toBeVisible();
  await expect(page.getByTestId("products-filter-machine-type")).toBeVisible();

  const firstProductCard = page.locator('article[data-testid^="product-card-"]').first();
  await expect(firstProductCard).toBeVisible();
});

test("product detail page shows gallery and CTA controls", async ({ page }) => {
  await page.goto("/products");

  const firstSpecs = page.locator('[data-testid^="product-card-specs-"]').first();
  await firstSpecs.click();

  await expect(page.getByTestId("product-gallery")).toBeVisible();
  await expect(page.getByTestId("product-primary-whatsapp")).toBeVisible();
  await expect(page.getByTestId("product-spec-sheet")).toBeVisible();
});

test("contact form can submit through mocked lead API", async ({ page }) => {
  await page.route("**/api/v1/leads", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "test-lead-id" }),
    });
  });

  await page.goto("/contact");

  await expect(page.getByTestId("contact-whatsapp")).toBeVisible();
  await page.getByTestId("lead-form-name").fill("Playwright Test");
  await page.getByTestId("lead-form-phone").fill("9876543210");
  await page.getByTestId("lead-form-email").fill("playwright@example.com");
  await page.getByTestId("lead-form-message").fill("Need a machine quote.");
  await page.getByTestId("lead-form-submit").click();

  await expect(
    page.getByText("Thanks — we received your enquiry."),
  ).toBeVisible();
});
