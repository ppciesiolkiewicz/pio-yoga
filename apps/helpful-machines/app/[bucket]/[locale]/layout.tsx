import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { locales } from "@repo/web/locale";
import { Document } from "@/components/Document";
import { buckets, resolveParams, type RouteParams } from "@/lib/params";
import { site } from "@/site.config";

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

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<RouteParams> }) {
  const { locale, assignment } = await resolveParams(params);
  return (
    <Document locale={locale} assignment={assignment}>
      {children}
    </Document>
  );
}
