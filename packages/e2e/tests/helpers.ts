import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";

/** Pre-set the stored colour mode before any page script runs. */
export async function storeColorMode(page: Page, mode: "light" | "dark") {
  await page.addInitScript((m) => {
    try {
      localStorage.setItem("colorMode", m);
    } catch {
      // storage blocked: test will see the system mode
    }
  }, mode);
}

/** True when an app's .env.local configures Resend: the no-JS contact test would send a real email, so it skips. */
export function resendConfigured(app: "helpful-machines" | "tangent"): boolean {
  const file = fileURLToPath(new URL(`../../../apps/${app}/.env.local`, import.meta.url));
  return existsSync(file) && /^\s*RESEND_API_KEY\s*=\s*\S+/m.test(readFileSync(file, "utf8"));
}

/** Relative luminance of a CSS rgb() colour (0 = black, 1 = white). */
export function luminance(rgb: string): number {
  const [r, g, b] = (rgb.match(/\d+(\.\d+)?/g) ?? ["0", "0", "0"]).slice(0, 3).map((v) => {
    const c = Number(v) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export const appOf = (baseURL: string | undefined) => (baseURL?.endsWith(":3002") ? "tangent" : "helpful-machines");
