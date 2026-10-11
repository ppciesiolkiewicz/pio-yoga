import { describe, expect, it } from "vitest";
import {
  breadcrumbList,
  faqPage,
  organization,
  person,
  professionalService,
  serializeJsonLd,
  service,
  website,
} from "../src/json-ld";

describe("json-ld builders", () => {
  it("organization", () =>
    expect(organization({ name: "Helpful Machines", url: "https://attunr.com", email: "hi@x.com" })).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Helpful Machines",
      url: "https://attunr.com",
      email: "hi@x.com",
    }));
  it("website", () =>
    expect(website({ name: "Tangent", url: "https://attunr.com", inLanguage: ["en-AU", "pl-PL"] })).toMatchObject({
      "@type": "WebSite",
      inLanguage: ["en-AU", "pl-PL"],
    }));
  it("professionalService lists countries served", () =>
    expect(
      professionalService({ name: "Tangent", url: "https://attunr.com", description: "d", areaServed: ["AU", "PL"] }),
    ).toMatchObject({
      "@type": "ProfessionalService",
      areaServed: [
        { "@type": "Country", name: "AU" },
        { "@type": "Country", name: "PL" },
      ],
    }));
  it("service links to its provider", () =>
    expect(
      service({ name: "Custom apps", description: "d", url: "https://a.com/s", providerName: "HM", providerUrl: "https://a.com", areaServed: ["AU"] }),
    ).toMatchObject({ "@type": "Service", provider: { "@type": "Organization", name: "HM", url: "https://a.com" } }));
  it("faqPage", () =>
    expect(faqPage([{ question: "Q?", answer: "A." }])).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } }],
    }));
  it("breadcrumbList numbers items from 1", () =>
    expect(breadcrumbList([{ name: "Home", url: "https://a.com/" }, { name: "Services", url: "https://a.com/services" }]).itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: "https://a.com/" },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://a.com/services" },
    ]));
  it("person omits empty optional fields", () =>
    expect(person({ name: "Piotr Ciesiolkiewicz", jobTitle: "Founder" })).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Piotr Ciesiolkiewicz",
      jobTitle: "Founder",
    }));
});

describe("serializeJsonLd", () => {
  it("escapes characters that could close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>", x: "\u2028" });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script");
    expect(out).toContain("\\u2028");
    expect(JSON.parse(out)).toEqual({ name: "</script><script>alert(1)</script>", x: "\u2028" });
  });
  it("serializes arrays", () => expect(JSON.parse(serializeJsonLd([{ a: 1 }, { b: 2 }]))).toEqual([{ a: 1 }, { b: 2 }]));
});
