import { describe, expect, it } from "vitest";
import { defineExperiments } from "../src/experiments";
import { decideRoute, isBot, isSkipped, NOT_FOUND_PATH, type RouteInput } from "../src/routing/decide";

const experiments = defineExperiments({
  hero: { variants: { control: "boring-bits", "easy-mode": "easy-mode" }, weights: [50, 50], markets: ["en", "pl"] },
});
const SAFARI = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 Version/17.5 Safari/605.1.15";
const run = (o: Partial<RouteInput>) =>
  decideRoute({
    pathname: "/",
    search: "",
    userAgent: SAFARI,
    country: "AU",
    cookies: {},
    experiments,
    random: () => 0.1,
    ...o,
  });
const expCookie = (value: string) => ({ name: "exp", value, maxAge: 7_776_000 });
const localeCookie = (value: string) => ({ name: "NEXT_LOCALE", value, maxAge: 31_536_000 });

describe("isSkipped", () => {
  it.each(["/api/contact", "/_next/static/a.js", "/_vercel/insights", "/ingest/e", "/favicon.ico", "/robots.txt",
    "/sitemap.xml", "/control/en/opengraph-image", "/control/en/opengraph-image-1a2b", "/og/home"])("%s", (p) =>
    expect(isSkipped(p)).toBe(true));
  it.each(["/", "/pl", "/services", "/work/onchain", "/pl/faq"])("not %s", (p) => expect(isSkipped(p)).toBe(false));
});

describe("isBot", () => {
  it.each([
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0)",
    "facebookexternalhit/1.1",
    "Mozilla/5.0 (compatible; SemrushBot/7~bl)",
    "Mozilla/5.0 (compatible; AhrefsBot/7.0)",
    "LinkedInBot/1.0",
    "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    "TelegramBot (like TwitterBot)",
    "Mozilla/5.0 (compatible; Pinterestbot/1.0; +http://www.pinterest.com/bot.html)",
  ])("bot: %s", (ua) => expect(isBot(ua)).toBe(true));
  it.each([
    "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 Chrome/131 Mobile Safari/537.36 Chrome-Lighthouse",
    "Mozilla/5.0 (Linux; Android 11; CUBOT P50) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36 [Pinterest/Android]",
    "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36 Telegram-Android/10.6.2",
    "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/120.0 Electron/27 Safari/537.36 Slack/4.35.126",
  ])("not a bot (audits, phones, in-app browsers): %s", (ua) => expect(isBot(ua)).toBe(false));
  it("headless browsers used by our E2E tests are not bots", () =>
    expect(isBot("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/131.0.0.0 Safari/537.36")).toBe(false));
  it("real browsers and a missing UA are not bots", () => {
    expect(isBot(SAFARI)).toBe(false);
    expect(isBot(null)).toBe(false);
  });
});

describe("decideRoute", () => {
  it("passes skipped paths through", () => expect(run({ pathname: "/api/contact" })).toEqual({ kind: "pass" }));

  it("rewrites english root into the bucket and sets the exp cookie", () =>
    expect(run({})).toEqual({ kind: "rewrite", pathname: "/control/en", setCookies: [expCookie("hero:control")] }));

  it("keeps an existing assignment without re-setting the cookie", () =>
    expect(run({ pathname: "/services", cookies: { exp: "hero:easy-mode" } })).toEqual({
      kind: "rewrite",
      pathname: "/easy-mode/en/services",
      setCookies: [],
    }));

  it("reassigns a stale exp cookie", () =>
    expect(run({ pathname: "/services", cookies: { exp: "hero:gone" } })).toEqual({
      kind: "rewrite",
      pathname: "/control/en/services",
      setCookies: [expCookie("hero:control")],
    }));

  it("keeps /plumbing english and normalises trailing slashes", () => {
    expect(run({ pathname: "/plumbing", cookies: { exp: "hero:control" } })).toMatchObject({ pathname: "/control/en/plumbing" });
    expect(run({ pathname: "/services/", cookies: { exp: "hero:control" } })).toMatchObject({ pathname: "/control/en/services" });
  });

  it("rewrites /pl paths and remembers the choice", () =>
    expect(run({ pathname: "/pl/services", cookies: { exp: "hero:control" } })).toEqual({
      kind: "rewrite",
      pathname: "/control/pl/services",
      setCookies: [localeCookie("pl")],
    }));

  it("does not re-set the locale cookie when it already says pl", () =>
    expect(run({ pathname: "/pl", cookies: { exp: "hero:control", locale: "pl" } })).toEqual({
      kind: "rewrite",
      pathname: "/control/pl",
      setCookies: [],
    }));

  it("redirects visitors in Poland to /pl keeping path and query", () => {
    expect(run({ pathname: "/services", search: "?utm_source=x", country: "PL" })).toEqual({
      kind: "redirect",
      status: 307,
      location: "/pl/services?utm_source=x",
      setCookies: [],
    });
    expect(run({ country: "pl" })).toMatchObject({ kind: "redirect", location: "/pl" });
  });

  it("does not geo-redirect once english was chosen", () =>
    expect(run({ country: "PL", cookies: { locale: "en", exp: "hero:control" } })).toMatchObject({ kind: "rewrite", pathname: "/control/en" }));

  it("sends returning visitors who chose polish back to /pl, from anywhere", () => {
    expect(run({ pathname: "/services", country: "PL", cookies: { locale: "pl", exp: "hero:control" } })).toEqual({
      kind: "redirect",
      status: 307,
      location: "/pl/services",
      setCookies: [],
    });
    expect(run({ country: "AU", cookies: { locale: "pl", exp: "hero:control" } })).toMatchObject({ kind: "redirect", location: "/pl" });
  });

  it("does not loop on /pl for visitors in Poland", () =>
    expect(run({ pathname: "/pl/faq", country: "PL", cookies: { exp: "hero:control" } })).toMatchObject({
      kind: "rewrite",
      pathname: "/control/pl/faq",
    }));

  it("never redirects bots and always serves control without cookies", () =>
    expect(
      run({
        pathname: "/services",
        country: "PL",
        userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        cookies: { exp: "hero:easy-mode" },
      }),
    ).toEqual({ kind: "rewrite", pathname: "/control/en/services", setCookies: [] }));

  it("?locale=en sets the cookie and redirects to the clean english URL", () =>
    expect(run({ pathname: "/pl/services", search: "?locale=en&x=1" })).toEqual({
      kind: "redirect",
      status: 307,
      location: "/services?x=1",
      setCookies: [localeCookie("en")],
    }));

  it("?locale=pl from an english page", () =>
    expect(run({ pathname: "/about", search: "?locale=pl" })).toEqual({
      kind: "redirect",
      status: 307,
      location: "/pl/about",
      setCookies: [localeCookie("pl")],
    }));

  it("an unknown ?locale is stripped without setting a cookie", () =>
    expect(run({ pathname: "/about", search: "?locale=de" })).toEqual({
      kind: "redirect",
      status: 307,
      location: "/about",
      setCookies: [],
    }));

  it("an explicit /en prefix permanently redirects to the unprefixed URL", () => {
    expect(run({ pathname: "/en/services", search: "?x=1" })).toEqual({
      kind: "redirect",
      status: 308,
      location: "/services?x=1",
      setCookies: [],
    });
    expect(run({ pathname: "/en" })).toMatchObject({ status: 308, location: "/" });
  });

  it("serves control where an experiment is not active in the market", () => {
    const enOnly = defineExperiments({
      design: { variants: { control: "dark", editorial: "editorial" }, weights: [50, 50], markets: ["en"] },
    });
    expect(run({ experiments: enOnly, pathname: "/pl", cookies: { exp: "design:editorial", locale: "pl" } })).toEqual({
      kind: "rewrite",
      pathname: "/control/pl",
      setCookies: [],
    });
  });

  it("clears the exp cookie when every experiment is removed", () =>
    expect(run({ experiments: defineExperiments({}), cookies: { exp: "hero:control" } })).toEqual({
      kind: "rewrite",
      pathname: "/default/en",
      setCookies: [{ name: "exp", value: "", maxAge: 0 }],
    }));
});

describe("unknown paths", () => {
  const known = new Set(["/", "/services", "/services/custom-apps-websites"]);
  const isKnownPath = (rest: string) => known.has(rest);
  it("rewrites unknown paths to the unmatched 404 route so Next serves the root not-found page", () => {
    expect(run({ pathname: "/services/nope", cookies: { exp: "hero:control" }, isKnownPath })).toEqual({
      kind: "rewrite",
      pathname: NOT_FOUND_PATH,
      setCookies: [],
    });
    expect(run({ pathname: "/pl/nope", cookies: { exp: "hero:control", locale: "pl" }, isKnownPath })).toMatchObject({
      pathname: NOT_FOUND_PATH,
    });
  });
  it("still serves known paths and still assigns buckets", () =>
    expect(run({ pathname: "/pl/services/custom-apps-websites", isKnownPath })).toEqual({
      kind: "rewrite",
      pathname: "/control/pl/services/custom-apps-websites",
      setCookies: [localeCookie("pl"), expCookie("hero:control")],
    }));
  it("treats every path as known when no checker is given", () =>
    expect(run({ pathname: "/whatever", cookies: { exp: "hero:control" } })).toMatchObject({ pathname: "/control/en/whatever" }));
});
