import { expect, test } from "@playwright/test";

test.describe("history", () => {
  test("after a contact result URL, Back returns to the contact page", async ({ context, page, baseURL }) => {
    await context.addCookies([{ name: "consent", value: "denied", url: baseURL! }]);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/contact?sent=1#contact-sent");
    const contactTitle = await page.getByRole("heading", { level: 1 }).textContent();
    await expect(page).toHaveURL(/\/contact$/);
    await page.getByRole("banner").getByRole("link", { name: "Services" }).click();
    await expect(page).toHaveURL(/\/services$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(contactTitle!);
  });
});
