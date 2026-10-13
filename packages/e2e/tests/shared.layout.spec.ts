import { expect, test } from "@playwright/test";

const PAGES = ["/", "/pl", "/contact", "/pl/contact"];

test.describe("layout on small screens", () => {
  for (const path of PAGES) {
    test(`no horizontal scrolling at 320px (WCAG 1.4.10) on ${path}`, async ({ context, page, baseURL }) => {
      await context.addCookies([{ name: "consent", value: "denied", url: baseURL! }]);
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("phones get the CTA in the menu, not squeezed into the header", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const header = page.getByRole("banner");
    await expect(header.getByRole("button", { name: "Menu" })).toBeVisible();
    await expect(header.getByRole("link", { name: /Book a/ })).toBeHidden();
    await header.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: /Book a/ })).toBeVisible();
  });
});
