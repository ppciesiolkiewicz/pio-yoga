import { ImageResponse } from "next/og";
import { isLocale, locales } from "@repo/web/locale";
import { getContent } from "@/content";
import { allPaths, ogKey, pageTitle, pathFromOgKey } from "@/lib/routes";

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.flatMap((locale) => allPaths.map((path) => ({ locale, page: ogKey(path) })));
}

/** Neutral (precision, dark) look: OG images are shared by both A/B designs. */
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string; page: string }> }) {
  const { locale, page } = await params;
  if (!isLocale(locale)) return new Response("Not found", { status: 404 });
  const t = getContent(locale);
  const title = pageTitle(t, pathFromOgKey(page));
  if (!title) return new Response("Not found", { status: 404 });
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0c0e",
          color: "#ecedef",
          padding: 72,
          backgroundImage: "linear-gradient(#16181c 1px, transparent 1px), linear-gradient(90deg, #16181c 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36 }}>
          <div style={{ display: "flex", width: 48, height: 4, background: "#ff7a1a" }} />
          Tangent
        </div>
        <div style={{ display: "flex", fontSize: 66, lineHeight: 1.05, letterSpacing: -1.5, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 28, color: "#a0a5ae" }}>{t.footer.tagline}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
