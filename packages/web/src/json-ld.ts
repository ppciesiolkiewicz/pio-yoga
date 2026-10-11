type Json = Record<string, unknown>;
const CONTEXT = "https://schema.org";

/** Drop undefined values and empty arrays so output stays minimal. */
function clean(obj: Json): Json {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0)),
  );
}
const countries = (codes: string[]) => codes.map((name) => ({ "@type": "Country", name }));

export function organization(o: { name: string; url: string; logo?: string; email?: string; sameAs?: string[] }) {
  return clean({ "@context": CONTEXT, "@type": "Organization", ...o });
}

export function website(o: { name: string; url: string; inLanguage: string[] }) {
  return clean({ "@context": CONTEXT, "@type": "WebSite", ...o });
}

export function professionalService(o: {
  name: string;
  url: string;
  description: string;
  areaServed: string[];
  email?: string;
  priceRange?: string;
}) {
  return clean({ "@context": CONTEXT, "@type": "ProfessionalService", ...o, areaServed: countries(o.areaServed) });
}

export function service(o: {
  name: string;
  description: string;
  url: string;
  providerName: string;
  providerUrl: string;
  areaServed: string[];
}) {
  return clean({
    "@context": CONTEXT,
    "@type": "Service",
    name: o.name,
    description: o.description,
    url: o.url,
    provider: { "@type": "Organization", name: o.providerName, url: o.providerUrl },
    areaServed: countries(o.areaServed),
  });
}

export function faqPage(items: { question: string; answer: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.question, acceptedAnswer: { "@type": "Answer", text: i.answer } })),
  };
}

export function breadcrumbList(items: { name: string; url: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((i, index) => ({ "@type": "ListItem", position: index + 1, name: i.name, item: i.url })),
  };
}

export function person(o: {
  name: string;
  jobTitle: string;
  url?: string;
  image?: string;
  sameAs?: string[];
  alumniOf?: string[];
  award?: string[];
}) {
  return clean({
    "@context": CONTEXT,
    "@type": "Person",
    ...o,
    alumniOf: o.alumniOf?.map((name) => ({ "@type": "CollegeOrUniversity", name })),
  });
}

/** JSON for a <script type="application/ld+json">: escapes "<" and line separators. */
export function serializeJsonLd(data: object | object[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
