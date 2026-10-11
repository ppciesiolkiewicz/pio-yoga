import { ImageResponse } from "next/og";
import { isLocale, locales } from "@repo/web/locale";
import { getContent } from "@/content";
import { allPaths, ogKey, pageTitle, pathFromOgKey } from "@/lib/routes";

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.flatMap((locale) => allPaths.map((path) => ({ locale, page: ogKey(path) })));
}

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
          background: "#fff6ea",
          color: "#1e1a15",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 36, fontWeight: 800 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#ff5a36" }} />
          Helpful Machines
        </div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 30, color: "#5a5146", borderTop: "4px solid #1e1a15", paddingTop: 24 }}>{t.footer.tagline}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
