/** Lighthouse CI for Tangent (mobile). Pages are served in whichever design the fresh visitor is bucketed into. */
const base = "http://localhost:3002";
module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm --filter tangent start",
      startServerReadyPattern: "Ready",
      url: ["/", "/pl", "/services/fresh-look", "/work", "/work/onchain", "/about", "/contact"].map((p) => base + p),
      numberOfRuns: 3,
      settings: { chromeFlags: "--headless=new --no-sandbox" },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95, aggregationMethod: "median-run" }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        canonical: "off",
        "resource-summary:script:size": ["error", { maxNumericValue: 184320 }],
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci/tangent" },
  },
};
