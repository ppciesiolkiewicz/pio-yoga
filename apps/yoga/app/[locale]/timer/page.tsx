import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import GongTimer from "@/components/GongTimer";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata(locale, "/timer", t.meta.timerTitle, t.meta.timerDescription);
}

export default async function TimerPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale).timer;

  return (
    <>
      <section className="page-head narrow">
        <h1 className="eyebrow">{t.eyebrow}</h1>
      </section>
      <section className="timer-sec">
        <GongTimer t={t} />
      </section>
    </>
  );
}
