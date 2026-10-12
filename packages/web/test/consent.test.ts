import { describe, expect, it } from "vitest";
import { analyticsPersistence, consentRequired, parseConsent } from "../src/consent";

describe("consent", () => {
  it("is required only in the polish market", () => {
    expect(consentRequired("pl")).toBe(true);
    expect(consentRequired("en")).toBe(false);
  });
  it("australia always persists normally", () => expect(analyticsPersistence("en", null)).toBe("localStorage+cookie"));
  it("poland stays in memory until consent is granted", () => {
    expect(analyticsPersistence("pl", null)).toBe("memory");
    expect(analyticsPersistence("pl", "denied")).toBe("memory");
    expect(analyticsPersistence("pl", "granted")).toBe("localStorage+cookie");
  });
  it("parses the cookie strictly", () => {
    expect(parseConsent("granted")).toBe("granted");
    expect(parseConsent("denied")).toBe("denied");
    expect(parseConsent("yes")).toBeNull();
    expect(parseConsent(undefined)).toBeNull();
  });
});

describe("consent for an unknown market", () => {
  it("is required when the market is unknown", () => expect(consentRequired(null)).toBe(true));
});
