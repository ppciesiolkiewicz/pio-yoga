import { expect, test } from "@playwright/test";
import { appOf, resendConfigured } from "./helpers";

async function fill(page: import("@playwright/test").Page) {
  await page.locator('[name="name"]').fill("Ania");
  await page.locator('[name="email"]').fill("ania@example.pl");
  await page.locator('[name="message"]').fill("We would like some help with our processes.");
}

test.describe("contact form", () => {
  test("with JavaScript: confirms success in the live region", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
    );
    await page.goto("/contact");
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Thanks! Your message is on its way." })).toBeVisible();
  });

  test("with JavaScript: field errors are linked, styled and focused", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ ok: false, error: "validation", fields: { email: "bad" } }) }),
    );
    await page.goto("/contact");
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    // Scoped to the form: Next.js adds its own (empty) role="alert" route announcer.
    const alert = page.locator("form").getByRole("alert");
    await expect(alert).toBeFocused();
    await expect(alert.getByRole("link")).toHaveAttribute("href", "#contact-email");
    await expect(page.locator('[name="email"]')).toHaveAttribute("aria-invalid", "true");
  });

  test("without JavaScript: the static page shows the API's result", async ({ browser, baseURL }) => {
    test.skip(resendConfigured(appOf(baseURL)), "Resend is configured locally: this would send a real email");
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/contact");
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page).toHaveURL(/\/contact\?error=unavailable#contact-error-unavailable$/);
    const result = page.locator("#contact-error-unavailable");
    await expect(result).toBeVisible();
    await expect(result.getByRole("link")).toHaveAttribute("href", /^mailto:/);
    await context.close();
  });
});
