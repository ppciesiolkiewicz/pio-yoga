import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import BuyButton from "@/components/BuyButton";
import CopyEmail from "@/components/CopyEmail";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata(locale, "/video", t.meta.videoTitle, t.meta.videoDescription);
}

export default async function VideoPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const v = t.video;
  const enabled = site.videoProgramEnabled;

  return (
    <>
      <section className="page-head">
        <div className="eyebrow">
          {v.eyebrow} {!enabled && <span className="badge">{v.badge}</span>}
        </div>
        <h1>{v.title}</h1>
        <p className="lead">{v.lead}</p>
      </section>

      <section className="two">
        <div>
          <h2 className="h-sm">{v.includesTitle}</h2>
          <ul className="dots">
            {v.includes.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
        <aside className="who">
          <h2>{v.bonusTitle}</h2>
          <p>{v.bonus}</p>
          {enabled ? (
            <>
              <BuyButton locale={locale} t={{ buy: v.buy, buying: v.buying, unavailable: v.unavailable, error: v.error }} />
              <p className="small">{v.priceNote}</p>
            </>
          ) : (
            <>
              <p className="small">{v.soon}</p>
              <CopyEmail email={site.email} copy={t.contact.copy} copied={t.contact.copied} />
            </>
          )}
        </aside>
      </section>
    </>
  );
}
