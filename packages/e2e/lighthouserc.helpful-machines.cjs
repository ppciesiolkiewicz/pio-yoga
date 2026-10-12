/** Lighthouse CI for Helpful Machines (mobile, default throttling). Reports stay local (filesystem). */
const base = "http://localhost:3001";
module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm --filter helpful-machines start",
      startServerReadyPattern: "Ready",
      url: ["/", "/pl", "/services", "/services/custom-apps-websites", "/pricing", "/contact"].map((p) => base + p),
      numberOfRuns: 3,
      settings: { chromeFlags: "--headless=new --no-sandbox" },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95, aggregationMethod: "median-run" }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        // Canonicals point at the production domain, not localhost; the build-output tests check them.
        canonical: "off",
        "resource-summary:script:size": ["error", { maxNumericValue: 184320 }],
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci/helpful-machines" },
  },
};
