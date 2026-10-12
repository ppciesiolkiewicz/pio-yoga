import { expect, test } from "@playwright/test";

test.describe("consent", () => {
  test("Poland: asks, stores the choice, moves focus to the content, and can be reopened", async ({ page, context }) => {
    await page.goto("/pl");
    const banner = page.getByRole("region", { name: "Zgoda na pliki cookie" });
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Odrzucam" }).click();
    await expect(banner).toBeHidden();
    await expect(page.locator("#main")).toBeFocused();
    expect((await context.cookies()).find((c) => c.name === "consent")?.value).toBe("denied");

    await page.reload();
    await expect(page.getByRole("button", { name: "Ustawienia prywatności" })).toBeVisible();
    await expect(banner).toBeHidden();

    const settings = page.getByRole("button", { name: "Ustawienia prywatności" });
    await settings.click();
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Akceptuję" }).click();
    await expect(settings).toBeFocused();
    expect((await context.cookies()).find((c) => c.name === "consent")?.value).toBe("granted");
  });

  test("Australia never shows a banner", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("region", { name: "Cookie consent" })).toHaveCount(0);
  });
});
