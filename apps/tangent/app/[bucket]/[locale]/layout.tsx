import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { locales } from "@repo/web/locale";
import { Document } from "@/components/Document";
import type { DesignKey } from "@/experiments";
import { buckets, resolveParams, type RouteParams } from "@/lib/params";
import { site } from "@/site.config";

type Props = { params: Promise<RouteParams> };

export const dynamicParams = false;

export function generateStaticParams() {
  return buckets.flatMap((bucket) => locales.map((locale) => ({ bucket, locale })));
}

const themeColors: Record<DesignKey, { light: string; dark: string }> = {
  "tangent-precision": { light: "#f7f7f5", dark: "#0b0c0e" },
  "tangent-editorial": { light: "#fafaf7", dark: "#141311" },
};

export async function generateViewport({ params }: Props): Promise<Viewport> {
  const { design } = await resolveParams(params);
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: themeColors[design].light },
      { media: "(prefers-color-scheme: dark)", color: themeColors[design].dark },
    ],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await resolveParams(params);
  return {
    metadataBase: new URL(site.url),
    description: t.meta.siteDescription,
    icons: { icon: "/icon.svg" },
    ...(site.googleVerification ? { verification: { google: site.googleVerification } } : {}),
  };
}

export default async function LocaleLayout({ children, params }: Props & { children: ReactNode }) {
  const { locale, design, assignment } = await resolveParams(params);
  return (
    <Document locale={locale} design={design} assignment={assignment}>
      {children}
    </Document>
  );
}
