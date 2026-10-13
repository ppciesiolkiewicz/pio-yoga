/** Lighthouse CI for Tangent (mobile), one design per config so each A/B design is gated deterministically. */
const base = "http://localhost:3002";
const budget = (performance) => ({
  "categories:performance": ["error", { minScore: performance, aggregationMethod: "median-run" }],
  "categories:accessibility": ["error", { minScore: 0.95 }],
  "categories:best-practices": ["error", { minScore: 0.95 }],
  "categories:seo": ["error", { minScore: 0.95 }],
  // Canonicals point at the production domain, not localhost; the build-output tests check them.
  canonical: "off",
  "resource-summary:script:size": ["error", { maxNumericValue: 184320 }],
});
module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm --filter tangent start",
      startServerReadyPattern: "Ready",
      url: ["/", "/pl", "/services/fresh-look", "/work", "/work/onchain", "/about", "/contact"].map((p) => base + p),
      numberOfRuns: 3,
      settings: { chromeFlags: "--headless=new --no-sandbox", extraHeaders: { Cookie: "exp=design:editorial" } },
    },
    assert: {
      assertMatrix: [
        { matchingUrlPattern: "^http://localhost:3002/(?!pl$).*", assertions: budget(0.95) },
        // Ruling (2026-10-13): Polish pages fetch Inter Tight's 90 KB Latin Extended file for ą/ę/ł,
        // which simulated slow-4G LCP can't hide; /pl measures 0.93-0.95. Proper fix: a Polish-glyph
        // subset font (next/font/local). Until then /pl is gated at 0.92 instead of 0.95.
        { matchingUrlPattern: "^http://localhost:3002/pl$", assertions: budget(0.92) },
      ],
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci/tangent-editorial" },
  },
};
