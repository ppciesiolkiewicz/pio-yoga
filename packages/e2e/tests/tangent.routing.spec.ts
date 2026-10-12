import { expect, test } from "@playwright/test";

test.describe("Tangent routing", () => {
  test("visitors in Poland land on the Polish case study", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, extraHTTPHeaders: { "x-vercel-ip-country": "PL" } });
    const page = await context.newPage();
    await page.goto("/work/onchain");
    await expect(page).toHaveURL(/\/pl\/work\/onchain$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Płatności kartą za kryptowaluty przy minimalnym kapitale");
    await context.close();
  });

  test("unknown Polish case studies get the branded 404", async ({ page }) => {
    const res = await page.goto("/pl/work/xyz");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Polski" })).toHaveAttribute("href", "/pl");
  });

  test("case-study cards credit Piotr's work at the client", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByText("Piotr's work at Officeworks")).toBeVisible();
  });

  test("case studies read fully without JavaScript", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/pl/work/onchain");
    for (const heading of ["Problem", "Efekt", "Co się zmieniło", "Technologie"]) {
      await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
    }
    await expect(page.getByRole("list", { name: "Technologie" }).getByRole("listitem")).toHaveCount(7);
    await context.close();
  });
});
