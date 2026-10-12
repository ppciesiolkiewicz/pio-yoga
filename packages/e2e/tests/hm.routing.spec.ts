import { expect, test } from "@playwright/test";

test.describe("Helpful Machines routing", () => {
  test("visitors in Poland land on /pl, keeping the page", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, extraHTTPHeaders: { "x-vercel-ip-country": "PL" } });
    const page = await context.newPage();
    await page.goto("/services");
    await expect(page).toHaveURL(/\/pl\/services$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "pl-PL");
    await context.close();
  });

  test("the footer language link keeps the page both ways, and the choice sticks", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, extraHTTPHeaders: { "x-vercel-ip-country": "PL" } });
    const page = await context.newPage();
    await page.goto("/pl/pricing");
    await page.getByRole("contentinfo").getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/:3001\/pricing$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en-AU");
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en-AU");
    await page.getByRole("contentinfo").getByRole("link", { name: "Polski" }).click();
    await expect(page).toHaveURL(/\/pl$/);
    await context.close();
  });

  test("the hero variant stays the same across reloads", async ({ page }) => {
    await page.goto("/");
    const first = await page.getByRole("heading", { level: 1 }).textContent();
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(first!);
    }
  });

  test("a forced variant shows its headline", async ({ context, page, baseURL }) => {
    await context.addCookies([{ name: "exp", value: "hero:easy-mode", url: baseURL! }]);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Put your business on easy mode.");
  });

  test("unknown pages get the branded 404", async ({ page }) => {
    const res = await page.goto("/nope");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  });

  test("trailing slashes redirect to the canonical URL", async ({ page }) => {
    await page.goto("/services/");
    await expect(page).toHaveURL(/:3001\/services$/);
  });
});
