import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const { NavLinks } = await import("../src/components/NavLinks");
const { LanguageLink } = await import("../src/components/LanguageLink");
const { MobileMenu } = await import("../src/components/MobileMenu");
const { SiteHeader } = await import("../src/components/SiteHeader");
const { SiteFooter } = await import("../src/components/SiteFooter");

const buckets = ["control", "easy-mode"];
const items = [
  { href: "/pl/services", label: "Usługi" },
  { href: "/pl/pricing", label: "Cennik" },
];
const colorMode = { group: "Tryb kolorów", light: "Jasny", dark: "Ciemny", system: "Systemowy" };
const cta = { href: "/pl/contact", label: "Umów bezpłatną rozmowę" };

beforeEach(() => {
  pathname = "/";
});

describe("NavLinks", () => {
  it("marks the current section, including its subpages", () => {
    pathname = "/control/pl/services/custom-apps-websites";
    render(<NavLinks items={items} buckets={buckets} />);
    expect(screen.getByRole("link", { name: "Usługi" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Cennik" }).getAttribute("aria-current")).toBeNull();
  });
  it("draws the current-page underline in a colour with ≥3:1 contrast (accent-text, not accent)", () => {
    pathname = "/pl/services";
    render(<NavLinks items={items} buckets={buckets} />);
    const classes = screen.getByRole("link", { name: "Usługi" }).className.split(/\s+/);
    expect(classes).toContain("decoration-accent-text");
    expect(classes).not.toContain("decoration-accent");
  });
  it("works with public paths too", () => {
    pathname = "/pl/pricing";
    render(<NavLinks items={items} buckets={buckets} />);
    expect(screen.getByRole("link", { name: "Cennik" }).getAttribute("aria-current")).toBe("page");
  });
});

describe("LanguageLink", () => {
  const labels = { en: "English", pl: "Polski" };
  it("links English pages straight to the same Polish page", () => {
    pathname = "/easy-mode/en/pricing";
    render(<LanguageLink locale="en" buckets={buckets} labels={labels} />);
    const a = screen.getByRole("link", { name: "Polski" });
    expect(a.getAttribute("href")).toBe("/pl/pricing");
    expect(a.getAttribute("hreflang")).toBe("pl-PL");
    expect(a.getAttribute("lang")).toBe("pl-PL");
  });
  it("links Polish pages to English with ?locale=en so the choice sticks", () => {
    pathname = "/control/pl/pricing";
    render(<LanguageLink locale="pl" buckets={buckets} labels={labels} />);
    expect(screen.getByRole("link", { name: "English" }).getAttribute("href")).toBe("/pricing?locale=en");
  });
  it("handles the Polish home page", () => {
    pathname = "/control/pl";
    render(<LanguageLink locale="pl" buckets={buckets} labels={labels} />);
    expect(screen.getByRole("link", { name: "English" }).getAttribute("href")).toBe("/?locale=en");
  });
});

describe("MobileMenu", () => {
  it("opens a titled dialog with nav, colour mode and CTA, and closes", async () => {
    render(<MobileMenu items={items} buckets={buckets} cta={cta} labels={{ menu: "Menu", close: "Zamknij menu", colorMode }} />);
    await userEvent.click(screen.getByRole("button", { name: "Menu" }));
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    expect(within(dialog).getByRole("link", { name: "Usługi" })).toBeTruthy();
    expect(within(dialog).getByRole("radiogroup", { name: "Tryb kolorów" })).toBeTruthy();
    expect(within(dialog).getByRole("link", { name: "Umów bezpłatną rozmowę" })).toBeTruthy();
    await userEvent.click(within(dialog).getByRole("button", { name: "Zamknij menu" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("closes when a link is chosen", async () => {
    render(<MobileMenu items={items} buckets={buckets} cta={cta} labels={{ menu: "Menu", close: "Zamknij menu", colorMode }} />);
    await userEvent.click(screen.getByRole("button", { name: "Menu" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Cennik" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("SiteHeader / SiteFooter", () => {
  it("header has a labelled primary nav and a home link", () => {
    render(
      <SiteHeader brand="Helpful Machines" homeHref="/pl" nav={items} buckets={buckets} cta={cta}
        labels={{ primary: "Główna", menu: "Menu", close: "Zamknij menu", colorMode }} />,
    );
    expect(screen.getByRole("navigation", { name: "Główna" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Helpful Machines" }).getAttribute("href")).toBe("/pl");
  });
  it("footer shows the email, legal links and language link", () => {
    render(
      <SiteFooter brand="Helpful Machines" tagline="Tagline" nav={items} navLabel="Stopka"
        email={{ label: "E-mail", address: "hello@attunr.com" }} legal="NIP: do uzupełnienia"
        legalLinks={[{ href: "/pl/privacy", label: "Prywatność" }]} languageLink={<a href="/pricing?locale=en">English</a>} />,
    );
    expect(screen.getByRole("navigation", { name: "Stopka" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "hello@attunr.com" }).getAttribute("href")).toBe("mailto:hello@attunr.com");
    expect(screen.getByRole("link", { name: "Prywatność" })).toBeTruthy();
    expect(screen.getByText("NIP: do uzupełnienia")).toBeTruthy();
  });
});
