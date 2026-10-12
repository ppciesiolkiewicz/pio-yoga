import { execFileSync } from "node:child_process";
import { chromium } from "@playwright/test";

// Use Playwright's Chromium so Lighthouse doesn't depend on a system Chrome.
const env = { ...process.env, CHROME_PATH: chromium.executablePath() };
let failed = false;
for (const app of ["helpful-machines", "tangent"]) {
  try {
    execFileSync("pnpm", ["exec", "lhci", "autorun", `--config=lighthouserc.${app}.cjs`], { stdio: "inherit", env });
  } catch {
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
