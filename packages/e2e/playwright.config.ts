import { defineConfig, devices } from "@playwright/test";

/**
 * Runs against the BUILT apps (turbo builds them first).
 * Never sends real email: the servers start with the Resend variables blanked, and Next's env
 * loading never overrides variables that are already set, so no .env file can enable sending.
 */
const noEmail = { RESEND_API_KEY: "", CONTACT_TO_EMAIL: "" };
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: { trace: "retain-on-failure", reducedMotion: "reduce" },
  webServer: [
    {
      command: "pnpm --filter helpful-machines start",
      url: "http://localhost:3001/robots.txt",
      reuseExistingServer: !process.env.CI,
      env: noEmail,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter tangent start",
      url: "http://localhost:3002/robots.txt",
      reuseExistingServer: !process.env.CI,
      env: noEmail,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "hm",
      testMatch: /(shared|hm)\..*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3001" },
    },
    {
      name: "tangent",
      testMatch: /(shared|tangent)\..*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3002" },
    },
  ],
});
