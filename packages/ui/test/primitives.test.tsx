import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button, buttonClasses } from "../src/components/Button";
import { ButtonLink, SmartLink } from "../src/components/SmartLink";
import { Section } from "../src/components/Section";
import { ChipList } from "../src/components/ChipList";
import { SkipLink } from "../src/components/SkipLink";
import { JsonLd } from "../src/components/JsonLd";
import { ANALYTICS_EVENT, track } from "../src/events";

describe("Button", () => {
  it("defaults to type=button so it never submits forms by accident", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).getAttribute("type")).toBe("button");
  });
  it("has variant classes", () => {
    expect(buttonClasses("primary")).toContain("shadow-cta");
    expect(buttonClasses("secondary")).toContain("border-line");
  });
});

describe("SmartLink", () => {
  it("renders internal links without target", () => {
    render(<SmartLink href="/pl/services">Usługi</SmartLink>);
    const a = screen.getByRole("link", { name: "Usługi" });
    expect(a.getAttribute("href")).toBe("/pl/services");
    expect(a.getAttribute("target")).toBeNull();
  });
  it("opens external links in a new tab and says so to screen readers", () => {
    render(<SmartLink href="https://cal.com/x" external track="booking_opened" newTabLabel="(opens in a new tab)">Book</SmartLink>);
    const a = screen.getByRole("link", { name: "Book (opens in a new tab)" });
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    expect(a.getAttribute("data-track")).toBe("booking_opened");
  });
  it("ButtonLink styles a link as a button", () => {
    render(<ButtonLink link={{ href: "/contact", label: "Book a free chat", track: "cta_click", trackLocation: "hero" }} />);
    const a = screen.getByRole("link", { name: "Book a free chat" });
    expect(a.className).toContain("shadow-cta");
    expect(a.getAttribute("data-track-location")).toBe("hero");
  });
});

describe("Section", () => {
  it("labels the section by its heading", () => {
    render(<Section id="fixes" eyebrow="What we fix" title="Sound familiar?" intro="Intro">x</Section>);
    const region = screen.getByRole("region", { name: "Sound familiar?" });
    expect(region.id).toBe("fixes");
    expect(screen.getByRole("heading", { level: 2, name: "Sound familiar?" })).toBeTruthy();
  });
  it("can render an h1 for page headers", () => {
    render(<Section id="top" title="Pricing" headingLevel="h1">x</Section>);
    expect(screen.getByRole("heading", { level: 1, name: "Pricing" })).toBeTruthy();
  });
});

describe("ChipList / SkipLink / JsonLd", () => {
  it("renders chips as a labelled list", () => {
    render(<ChipList items={["AI assistants", "Custom apps"]} label="Services" />);
    expect(screen.getByRole("list", { name: "Services" }).children).toHaveLength(2);
  });
  it("skip link targets #main", () => {
    render(<SkipLink label="Skip to content" />);
    expect(screen.getByRole("link", { name: "Skip to content" }).getAttribute("href")).toBe("#main");
  });
  it("JsonLd escapes the payload", () => {
    const { container } = render(<JsonLd data={{ name: "</script>" }} />);
    const script = container.querySelector('script[type="application/ld+json"]')!;
    expect(script.innerHTML).not.toContain("</script>");
    expect(JSON.parse(script.innerHTML)).toEqual({ name: "</script>" });
  });
});

describe("track", () => {
  it("dispatches an analytics event on window", () => {
    const seen = vi.fn();
    window.addEventListener(ANALYTICS_EVENT, (e) => seen((e as CustomEvent).detail));
    track("form_submitted", { success: true });
    expect(seen).toHaveBeenCalledWith({ event: "form_submitted", properties: { success: true } });
  });
});
