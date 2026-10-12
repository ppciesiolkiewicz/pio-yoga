import { describe, expect, it } from "vitest";
import { posthogRewrites, securityHeaders } from "../src/headers";

const get = (headers: { key: string; value: string }[], key: string) => headers.find((h) => h.key === key)?.value;

describe("securityHeaders", () => {
  it("locks the CSP to self, with no framing, objects or foreign forms", () => {
    const csp = get(securityHeaders({ dev: false, https: true }), "Content-Security-Policy")!;
    for (const part of ["default-src 'self'", "frame-ancestors 'none'", "form-action 'self'", "object-src 'none'", "connect-src 'self'"]) {
      expect(csp).toContain(part);
    }
    expect(csp).not.toContain("unsafe-eval");
  });
  it("allows eval only in development", () =>
    expect(get(securityHeaders({ dev: true, https: false }), "Content-Security-Policy")).toContain("'unsafe-eval'"));
  it("upgrades requests and sends HSTS only over https deployments", () => {
    const deployed = securityHeaders({ dev: false, https: true });
    expect(get(deployed, "Content-Security-Policy")).toContain("upgrade-insecure-requests");
    expect(get(deployed, "Strict-Transport-Security")).toContain("max-age=63072000");
    const local = securityHeaders({ dev: false, https: false });
    expect(get(local, "Content-Security-Policy")).not.toContain("upgrade-insecure-requests");
    expect(get(local, "Strict-Transport-Security")).toBeUndefined();
  });
  it("sends the usual hardening headers", () => {
    const h = securityHeaders({ dev: false, https: true });
    expect(get(h, "X-Content-Type-Options")).toBe("nosniff");
    expect(get(h, "X-Frame-Options")).toBe("DENY");
    expect(get(h, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });
});

describe("posthogRewrites", () => {
  it("proxies the EU host and assets through /ingest", () =>
    expect(posthogRewrites()).toEqual([
      { source: "/ingest/static/:path*", destination: "https://eu-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/:path*", destination: "https://eu.i.posthog.com/:path*" },
    ]));
});
