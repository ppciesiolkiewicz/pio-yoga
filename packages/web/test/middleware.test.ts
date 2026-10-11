import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { defineExperiments } from "../src/experiments";
import { createRoutingMiddleware } from "../src/routing/middleware";

const experiments = defineExperiments({
  hero: { variants: { control: "boring-bits", "easy-mode": "easy-mode" }, weights: [50, 50], markets: ["en", "pl"] },
});
const middleware = createRoutingMiddleware({ experiments, random: () => 0.9 });
const request = (url: string, headers: Record<string, string> = {}) => new NextRequest(url, { headers });

describe("createRoutingMiddleware", () => {
  it("rewrites to the bucket and sets cookies", () => {
    const res = middleware(request("https://attunr.com/services"));
    expect(res.headers.get("x-middleware-rewrite")).toBe("https://attunr.com/easy-mode/en/services");
    const cookie = res.cookies.get("exp");
    expect(cookie?.value).toBe("hero:easy-mode");
    expect(cookie?.sameSite).toBe("lax");
    expect(cookie?.path).toBe("/");
    expect(cookie?.secure).toBe(true);
  });

  it("redirects with an absolute location and the decided status", () => {
    const res = middleware(request("https://attunr.com/services?a=1", { "x-vercel-ip-country": "PL" }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://attunr.com/pl/services?a=1");
  });

  it("reads existing cookies", () => {
    const res = middleware(request("https://attunr.com/", { cookie: "exp=hero:control; NEXT_LOCALE=en", "x-vercel-ip-country": "PL" }));
    expect(res.headers.get("x-middleware-rewrite")).toBe("https://attunr.com/control/en");
    expect(res.cookies.getAll()).toEqual([]);
  });

  it("passes through skipped paths", () => {
    const res = middleware(request("https://attunr.com/api/contact"));
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("does not mark cookies secure on plain http (local dev)", () => {
    const res = middleware(request("http://localhost:3000/"));
    expect(res.cookies.get("exp")?.secure).toBe(false);
  });
});
