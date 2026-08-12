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

test("blog detail renders markdown headings instead of raw hashes", async ({
  page,
}) => {
  await page.goto("/blog/auger-vs-cup-filler-packing-machine");

  // Fallback if that slug is unpublished: open first listing card
  if (page.url().includes("404") || (await page.getByText(/not found/i).count())) {
    await page.goto("/blog");
    const firstPost = page
      .locator('a[href^="/blog/"]')
      .filter({ has: page.locator("h2") })
      .first();
    await expect(firstPost).toBeVisible();
    await firstPost.click();
  }

  await expect(page).toHaveURL(/\/blog\/.+/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("markdown-content")).toBeVisible();

  const articleText = await page.getByTestId("markdown-content").innerText();
  expect(articleText).not.toMatch(/^##\s/m);
  expect(articleText).not.toMatch(/\*\*[^*]+\*\*/);

  const rawHashes = page.locator("main").getByText("## ", { exact: false });
  await expect(rawHashes).toHaveCount(0);
});

test("case study detail shows challenge solution results cards", async ({
  page,
}) => {
  await page.goto("/case-studies/rupesh-talan-aligarh");

  if (page.url().includes("404") || (await page.getByText(/not found/i).count())) {
    await page.goto("/case-studies");
    const firstStory = page
      .locator('a[href^="/case-studies/"]')
      .filter({ has: page.locator("h2") })
      .first();
    await expect(firstStory).toBeVisible();
    await firstStory.click();
  }

  await expect(page).toHaveURL(/\/case-studies\/.+/);
  await expect(page.getByTestId("case-challenge")).toBeVisible();
  await expect(page.getByTestId("case-solution")).toBeVisible();
  await expect(page.getByTestId("case-results")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Challenge" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Solution" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Results" })).toBeVisible();
});

test("navigation mounts top progress loader on public pages", async ({
  page,
}) => {
  await page.goto("/");

  // nextjs-toploader injects #nprogress CSS into the document head
  const hasNprogressCss = await page.evaluate(() => {
    const styles = Array.from(document.querySelectorAll("style"));
    return styles.some((el) => (el.textContent || "").includes("#nprogress"));
  });
  expect(hasNprogressCss).toBe(true);

  await page.locator('a[href="/products"]').first().click();
  await expect(page).toHaveURL(/\/products/);
  await expect(
    page.getByRole("heading", { name: /All packing machines/i }),
  ).toBeVisible();
});
