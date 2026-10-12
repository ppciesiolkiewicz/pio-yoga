import { Inter_Tight, Instrument_Serif } from "next/font/google";
import type { ReactNode } from "react";
import { Analytics } from "@repo/ui/Analytics";
import { ConsentBanner, ConsentSettingsButton } from "@repo/ui/ConsentBanner";
import { JsonLd } from "@repo/ui/JsonLd";
import { LanguageLink } from "@repo/ui/LanguageLink";
import { SiteFooter } from "@repo/ui/SiteFooter";
import { SiteHeader } from "@repo/ui/SiteHeader";
import { SkipLink } from "@repo/ui/SkipLink";
import { colorModeScript } from "@repo/web/color-mode";
import { consentRequired } from "@repo/web/consent";
import { activeAssignment, type Assignment } from "@repo/web/experiments";
import { organization, professionalService, website } from "@repo/web/json-ld";
import { htmlLang, localizedPath, type Locale } from "@repo/web/locale";
import { getContent } from "@/content";
import { experiments, type DesignKey } from "@/experiments";
import { bookingLink, footerLinks, navItems } from "@/lib/links";
import { buckets } from "@/lib/params";
import { site } from "@/site.config";
import { Logo } from "./Logo";
import "../app/globals.css";

// `subsets` only controls preloading: every subset is still declared (unicode-range), so Polish
// pages fetch Latin Extended on demand while English pages preload just one file.
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
  preload: false,
});

/** The full HTML document for both designs; also used by the root 404. */
export function Document({
  locale,
  design,
  assignment,
  analyticsMarket = locale,
  languageLink,
  children,
}: {
  locale: Locale;
  design: DesignKey;
  assignment: Assignment;
  /** null on the root 404, where the visitor's market is unknown (analytics stays cookieless). */
  analyticsMarket?: Locale | null;
  /** Overrides the footer language link (the root 404 has no page to switch). */
  languageLink?: ReactNode;
  children: ReactNode;
}) {
  const t = getContent(locale);
  const brand = <Logo design={design} />;
  const nav = navItems(locale, t);
  const askConsent = consentRequired(locale);
  return (
    <html
      lang={htmlLang[locale]}
      data-design={design}
      className={`${interTight.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: colorModeScript }} />
      </head>
      <body className="min-h-dvh bg-bg font-body text-ink antialiased">
        <SkipLink label={t.nav.skip} />
        <SiteHeader
          brand={brand}
          homeHref={localizedPath(locale, "/")}
          nav={nav}
          buckets={buckets}
          cta={bookingLink(locale, t, "header")}
          labels={{ primary: t.nav.primary, menu: t.nav.menu, close: t.nav.close, colorMode: t.nav.colorMode }}
          newTabLabel={t.nav.newTab}
        />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter
          brand={brand}
          tagline={t.footer.tagline}
          nav={nav}
          navLabel={t.footer.navLabel}
          email={{ label: t.footer.contactLabel, address: site.contactEmail }}
          legal={t.footer.legal}
          legalLinks={footerLinks(locale, t)}
          languageLink={languageLink ?? <LanguageLink locale={locale} buckets={buckets} labels={t.footer.languages} />}
          extra={askConsent ? <ConsentSettingsButton label={t.consent.settings} /> : undefined}
        />
        {askConsent && <ConsentBanner labels={t.consent} policyHref={localizedPath(locale, "/privacy")} />}
        <Analytics apiKey={site.posthogKey} locale={analyticsMarket} assignment={activeAssignment(experiments, assignment, locale)} />
        <JsonLd
          data={[
            organization({ name: site.name, url: site.url, email: site.contactEmail }),
            website({ name: site.name, url: site.url, inLanguage: ["en-AU", "pl-PL"] }),
            professionalService({ name: site.name, url: site.url, description: t.meta.siteDescription, areaServed: ["AU", "PL"], email: site.contactEmail }),
          ]}
        />
      </body>
    </html>
  );
}
