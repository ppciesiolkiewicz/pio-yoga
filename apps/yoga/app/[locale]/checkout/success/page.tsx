import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n";
import { bookingHref } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).checkout.successTitle, robots: { index: false, follow: false } };
}

export default async function SuccessPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale).checkout;
  const booking = bookingHref(locale);

  return (
    <section className="page-head narrow">
      <h1>{t.successTitle}</h1>
      <p className="lead">{t.successBody}</p>
      <div className="ctas">
        <a className="btn primary" href={booking} {...(booking.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>
          {t.book}
        </a>
        <Link className="btn" href={`/${locale}`}>{t.home}</Link>
      </div>
    </section>
  );
}
