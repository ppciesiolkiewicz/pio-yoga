import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConnectDots } from "../src/components/ConnectDots";
import { initials, PersonCard } from "../src/components/PersonCard";

// jsdom gives import.meta.url an http: scheme, so resolve from the package root (vitest cwd).
const css = readFileSync(join(process.cwd(), "src/styles/tangent.css"), "utf8");

describe("tangent tokens", () => {
  it("defines both designs in light, dark and the no-JS fallback", () => {
    for (const design of ["tangent-precision", "tangent-editorial"]) {
      expect(css).toContain(`:root[data-design="${design}"] {`);
      expect(css).toContain(`:root[data-design="${design}"][data-theme="dark"]`);
      expect(css).toContain(`:root[data-design="${design}"]:not([data-theme])`);
    }
  });
  it("sets every token the components use, in every set", () => {
    const blocks = css.split(/\n(?=:root|@media)/).filter((b) => b.includes("--bg:"));
    expect(blocks.length).toBe(6);
    for (const block of blocks) {
      for (const token of ["--bg", "--surface", "--ink", "--muted", "--line", "--control-border", "--accent", "--accent-text", "--accent-ink", "--highlight", "--focus"]) {
        expect(block, token).toContain(`${token}:`);
      }
    }
  });
});

describe("ConnectDots", () => {
  it("is decorative and labels each dot", () => {
    const { container } = render(
      <ConnectDots labels={{ idea: "idea", market: "market", users: "users", data: "data", tech: "tech", product: "product" }} />,
    );
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.classList.contains("tg-dots")).toBe(true);
    expect([...svg.querySelectorAll("text")].map((t) => t.textContent)).toEqual(["idea", "market", "users", "data", "tech", "product"]);
  });
});

describe("PersonCard", () => {
  it("derives initials", () => {
    expect(initials("Piotr Ciesiolkiewicz")).toBe("PC");
    expect(initials("Ana")).toBe("A");
    expect(initials("  maria  de la cruz ")).toBe("MC");
  });
  it("shows a monogram when there's no photo", () => {
    render(<PersonCard name="Piotr Ciesiolkiewicz" role="Founder" links={[{ label: "LinkedIn", href: "https://linkedin.com/in/x" }]} />);
    expect(screen.getByRole("heading", { level: 3, name: "Piotr Ciesiolkiewicz" })).toBeTruthy();
    expect(screen.getByText("PC").getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("link", { name: "LinkedIn" }).getAttribute("href")).toBe("https://linkedin.com/in/x");
  });
});

describe("tangent decorations", () => {
  it("hides decorative text from screen readers with CSS alt text", () => {
    expect(css).toContain('content: "// " / "";');
    expect(css).toMatch(/content: counter\(tg-section, decimal-leading-zero\) " — " \/ "";/);
  });
  it("numbers only h2 section eyebrows in editorial (not the hero, not page titles)", () =>
    expect(css).toContain('[data-design="tangent-editorial"] main [data-eyebrow="h2"]::before'));
  it("separates precision chips", () => expect(css).toContain('[data-design="tangent-precision"] [data-chips] li + li::before'));
  it("defines a mono font in editorial too", () => {
    const editorial = css.slice(css.indexOf(':root[data-design="tangent-editorial"] {'));
    expect(editorial.slice(0, editorial.indexOf("}"))).toContain("--font-mono-family:");
  });
  it("draws the dots path with a normalised length", () => {
    const { container } = render(
      <ConnectDots labels={{ idea: "i", market: "m", users: "u", data: "d", tech: "t", product: "p" }} />,
    );
    expect(container.querySelector(".tg-path")?.getAttribute("pathLength")).toBe("1");
  });
});
