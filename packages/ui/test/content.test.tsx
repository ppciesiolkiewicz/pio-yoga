import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "../src/components/Hero";
import { Highlight } from "../src/components/Highlight";
import { ServiceCard } from "../src/components/ServiceCard";
import { StepList } from "../src/components/StepList";
import { PricingCard } from "../src/components/PricingCard";
import { FaqList } from "../src/components/FaqList";
import { CtaBand } from "../src/components/CtaBand";

describe("Hero", () => {
  it("renders the h1 with highlighted words and a tracked CTA", () => {
    render(
      <Hero
        eyebrow="AI and IT help"
        title={<>Put your business on <Highlight>easy mode</Highlight>.</>}
        lead="Lead"
        primary={{ href: "/contact", label: "Book a free chat", track: "cta_click" }}
        secondary={{ href: "/services", label: "See what we do" }}
        chips={["AI assistants", "Custom apps"]}
        chipsLabel="What we help with"
      />,
    );
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.textContent).toBe("Put your business on easy mode.");
    expect(h1.querySelector("mark")?.textContent).toBe("easy mode");
    expect(screen.getByRole("link", { name: "Book a free chat" }).getAttribute("data-track-location")).toBe("hero");
    expect(screen.getByRole("list", { name: "What we help with" })).toBeTruthy();
  });
});

describe("ServiceCard", () => {
  it("uses the title as the link (no 'learn more' link text)", () => {
    render(<ServiceCard title="Custom apps & websites" summary="S" href="/services/custom-apps-websites" linkLabel="Learn more" />);
    const link = screen.getByRole("link", { name: "Custom apps & websites" });
    expect(link.getAttribute("href")).toBe("/services/custom-apps-websites");
    expect(screen.queryByRole("link", { name: /learn more/i })).toBeNull();
    expect(screen.getByRole("heading", { level: 3 })).toBeTruthy();
  });
  it("can be an h2 when directly under the page h1", () => {
    render(<ServiceCard title="T" summary="S" href="/x" linkLabel="More" headingLevel="h2" />);
    expect(screen.getByRole("heading", { level: 2, name: "T" })).toBeTruthy();
  });
});

describe("StepList", () => {
  it("is an ordered list of steps", () => {
    render(<StepList steps={[{ title: "Free chat", body: "B" }, { title: "Plan", body: "B" }]} />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("heading", { level: 3, name: "Free chat" })).toBeTruthy();
  });
});

describe("PricingCard", () => {
  it("shows name, price, features and CTA", () => {
    render(
      <PricingCard name="Quick win" price="From A$900" summary="S" features={["One focused improvement"]}
        cta={{ href: "/contact", label: "Book a free chat" }} headingLevel="h2" />,
    );
    const card = screen.getByRole("article");
    expect(within(card).getByRole("heading", { level: 2, name: "Quick win" })).toBeTruthy();
    expect(within(card).getByText("From A$900")).toBeTruthy();
    expect(within(card).getByText("One focused improvement")).toBeTruthy();
    expect(within(card).getByRole("link", { name: "Book a free chat" })).toBeTruthy();
  });
});

describe("FaqList", () => {
  it("uses native details so answers are in the HTML without JS", () => {
    const { container } = render(<FaqList items={[{ question: "How much?", answer: "From A$900." }]} />);
    const details = container.querySelector("details")!;
    expect(details.querySelector("summary")?.textContent).toContain("How much?");
    expect(details.textContent).toContain("From A$900.");
  });
});

describe("CtaBand", () => {
  it("is a labelled region with a tracked CTA", () => {
    render(<CtaBand title="Let's make something easier" body="B" cta={{ href: "/contact", label: "Book a free chat" }} />);
    expect(screen.getByRole("region", { name: "Let's make something easier" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Book a free chat" }).getAttribute("data-track-location")).toBe("cta_band");
  });
});
