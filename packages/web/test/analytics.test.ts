import { describe, expect, it } from "vitest";
import { exposureEvents, posthogConfig, superProperties } from "../src/analytics";

describe("posthogConfig", () => {
  it("uses the EU proxy and no recording or autocapture", () =>
    expect(posthogConfig("en", null)).toEqual({
      api_host: "/ingest",
      ui_host: "https://eu.posthog.com",
      persistence: "localStorage+cookie",
      capture_pageview: "history_change",
      capture_pageleave: true,
      autocapture: false,
      disable_session_recording: true,
    }));
  it("stays in memory on /pl until consent", () => {
    expect(posthogConfig("pl", null).persistence).toBe("memory");
    expect(posthogConfig("pl", "denied").persistence).toBe("memory");
    expect(posthogConfig("pl", "granted").persistence).toBe("localStorage+cookie");
  });
});

describe("superProperties", () => {
  it("adds market, colour mode and $feature/<experiment>", () =>
    expect(superProperties({ market: "pl", colorMode: "dark", assignment: { hero: "easy-mode" } })).toEqual({
      market: "pl",
      color_mode: "dark",
      "$feature/hero": "easy-mode",
    }));
});

describe("exposureEvents", () => {
  it("emits one $feature_flag_called per experiment", () =>
    expect(exposureEvents({ hero: "control" })).toEqual([
      { event: "$feature_flag_called", properties: { $feature_flag: "hero", $feature_flag_response: "control" } },
    ]));
  it("emits nothing without experiments", () => expect(exposureEvents({})).toEqual([]));
});
