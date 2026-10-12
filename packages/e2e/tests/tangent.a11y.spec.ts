import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { allPaths } from "../../../apps/tangent/lib/routes";
import { localizedPath } from "../../web/src/locale";
import { storeColorMode } from "./helpers";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const variant of ["control", "editorial"] as const) {
  for (const locale of ["en", "pl"] as const) {
    for (const mode of ["light", "dark"] as const) {
      for (const path of allPaths) {
        test(`a11y ${variant} ${locale} ${mode} ${path}`, async ({ context, page, baseURL }) => {
          await context.addCookies([{ name: "exp", value: `design:${variant}`, url: baseURL! }]);
          await storeColorMode(page, mode);
          await page.goto(localizedPath(locale, path));
          await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
          await page.waitForLoadState("networkidle");
          const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
          const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
          expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
        });
      }
    }
  }
}
