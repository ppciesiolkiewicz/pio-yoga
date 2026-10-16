import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { site } from "@/lib/site";
import { body, display } from "@/lib/fonts";
import Header from "@/components/Header";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EDF0EC" },
    { media: "(prefers-color-scheme: dark)", color: "#111816" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  const verification: Metadata["verification"] = {};
  if (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION)
    verification.google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  if (process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION)
    verification.yandex = process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION;
  if (process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION)
    verification.other = { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION };

  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.title, template: "%s · Pio" },
    description: t.meta.description,
    applicationName: "Pio",
    authors: [{ name: "Pio" }],
    robots: { index: true, follow: true },
    verification,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`}>
      <body>
        {site.gtmId && (
          <>
            <Script id="gtm" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${site.gtmId}');`}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${site.gtmId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        )}
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Header locale={locale} t={t.nav} />
        <main id="main" className="wrap">
          {children}
        </main>
        <footer className="site-footer">
          <div className="wrap">
            © {new Date().getFullYear()} Pio · {t.footer}
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
