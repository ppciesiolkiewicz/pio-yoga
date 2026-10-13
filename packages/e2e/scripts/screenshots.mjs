import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const out = new URL("../../../.superpowers/quality/screens/", import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const shots = [];
for (const mode of ["light", "dark"]) {
  for (const [w, h, label] of [[1280, 900, "desktop"], [390, 844, "phone"]]) {
    for (const path of ["/", "/services/custom-apps-websites", "/contact", "/pl/pricing"]) shots.push({ app: "hm", base: "http://localhost:3001", cookie: null, mode, w, h, label, path });
    for (const variant of ["control", "editorial"]) {
      for (const path of ["/", "/work/onchain", "/about"]) shots.push({ app: `tangent-${variant}`, base: "http://localhost:3002", cookie: `design:${variant}`, mode, w, h, label, path });
    }
  }
}

const browser = await chromium.launch();
for (const s of shots) {
  const context = await browser.newContext({ viewport: { width: s.w, height: s.h }, reducedMotion: "reduce" });
  if (s.cookie) await context.addCookies([{ name: "exp", value: s.cookie, url: s.base }]);
  const page = await context.newPage();
  await page.addInitScript((m) => localStorage.setItem("colorMode", m), s.mode);
  await page.goto(s.base + s.path, { waitUntil: "networkidle" });
  const name = `${s.app}_${s.label}_${s.mode}_${s.path.replace(/\W+/g, "-") || "home"}.png`;
  await page.screenshot({ path: out + name, fullPage: true });
  await context.close();
}
await browser.close();
console.log(`${shots.length} screenshots → ${out}`);
