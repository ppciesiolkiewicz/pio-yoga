import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
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
import { activeAssignment } from "@repo/web/experiments";
import { organization, professionalService, website } from "@repo/web/json-ld";
import { htmlLang, locales, localizedPath } from "@repo/web/locale";
import { Logo } from "@/components/Logo";
import { experiments } from "@/experiments";
import { bookingLink, footerLinks, navItems } from "@/lib/links";
import { buckets, resolveParams, type RouteParams } from "@/lib/params";
import { site } from "@/site.config";
import "../../globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-bricolage", display: "swap" });

export const dynamicParams = false;

export function generateStaticParams() {
  return buckets.flatMap((bucket) => locales.map((locale) => ({ bucket, locale })));
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { t } = await resolveParams(params);
  return {
    metadataBase: new URL(site.url),
    description: t.meta.siteDescription,
    icons: { icon: "/icon.svg" },
    ...(site.googleVerification ? { verification: { google: site.googleVerification } } : {}),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff6ea" },
    { media: "(prefers-color-scheme: dark)", color: "#17140f" },
  ],
};

export default async function RootLayout({ children, params }: { children: ReactNode; params: Promise<RouteParams> }) {
  const { locale, assignment, t } = await resolveParams(params);
  const brand = (
    <>
      <Logo />
      {site.name}
    </>
  );
  const nav = navItems(locale, t);
  const askConsent = consentRequired(locale);
  return (
    <html lang={htmlLang[locale]} data-design={site.design} className={display.variable} suppressHydrationWarning>
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
          languageLink={<LanguageLink locale={locale} buckets={buckets} labels={t.footer.languages} />}
          extra={askConsent ? <ConsentSettingsButton label={t.consent.settings} /> : undefined}
        />
        {askConsent && <ConsentBanner labels={t.consent} policyHref={localizedPath(locale, "/privacy")} />}
        <Analytics apiKey={site.posthogKey} locale={locale} assignment={activeAssignment(experiments, assignment, locale)} />
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
