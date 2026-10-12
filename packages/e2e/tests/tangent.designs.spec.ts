import { expect, test } from "@playwright/test";
import { storeColorMode } from "./helpers";

const backgrounds = {
  control: { light: "rgb(247, 247, 245)", dark: "rgb(11, 12, 14)", design: "tangent-precision" },
  editorial: { light: "rgb(250, 250, 247)", dark: "rgb(20, 19, 17)", design: "tangent-editorial" },
} as const;

test.describe("Tangent designs", () => {
  for (const variant of ["control", "editorial"] as const) {
    for (const mode of ["light", "dark"] as const) {
      test(`${variant} in ${mode} mode uses its own tokens`, async ({ context, page, baseURL }) => {
        await context.addCookies([{ name: "exp", value: `design:${variant}`, url: baseURL! }]);
        await storeColorMode(page, mode);
        await page.goto("/");
        await expect(page.locator("html")).toHaveAttribute("data-design", backgrounds[variant].design);
        await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
        await expect(page.locator("body")).toHaveCSS("background-color", backgrounds[variant][mode]);
      });
    }
  }

  test("a visitor keeps one design across pages", async ({ page }) => {
    await page.goto("/");
    const design = await page.locator("html").getAttribute("data-design");
    for (const path of ["/work", "/services/fresh-look", "/about"]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-design", design!);
    }
  });

  test("decorative eyebrow text isn't in the accessibility tree", async ({ context, page, baseURL }) => {
    await context.addCookies([{ name: "exp", value: "design:editorial", url: baseURL! }]);
    await page.goto("/");
    const snapshot = await page.locator("#flows").ariaSnapshot();
    expect(snapshot).not.toMatch(/0\d —/);
  });
});
