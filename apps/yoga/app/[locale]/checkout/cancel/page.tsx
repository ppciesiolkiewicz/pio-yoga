import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).checkout.cancelTitle, robots: { index: false, follow: false } };
}

export default async function CancelPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale).checkout;

  return (
    <section className="page-head narrow">
      <h1>{t.cancelTitle}</h1>
      <p className="lead">{t.cancelBody}</p>
      <div className="ctas">
        <Link className="btn primary" href={`/${locale}/video`}>{t.back}</Link>
      </div>
    </section>
  );
}
