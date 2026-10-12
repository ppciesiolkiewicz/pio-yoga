import { expect, test } from "@playwright/test";
import { luminance, storeColorMode } from "./helpers";

test.describe("colour mode", () => {
  test("a stored choice applies before the page renders (no flash)", async ({ page }) => {
    await storeColorMode(page, "dark");
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForFunction(() => document.body !== null);
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
  });

  test("the switch persists across reloads and pages", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const header = page.getByRole("banner");
    await header.getByRole("radio", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(header.getByRole("radio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
    await page.goto("/contact");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("System follows the OS live", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("without JavaScript the OS preference still applies", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/");
    expect(await page.locator("html").getAttribute("data-theme")).toBeNull();
    const bg = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(luminance(bg)).toBeLessThan(0.05);
    await context.close();
  });

  test("mobile menu: opens, keeps focus inside, closes on Escape and returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Menu" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
