import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/content/en";
import LangSwitch from "./LangSwitch";

export default function Header({ locale, t }: { locale: Locale; t: Dictionary["nav"] }) {
  const base = `/${locale}`;
  return (
    <header className="top">
      <div className="wrap">
        <Link className="mark" href={base} aria-label={t.home}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="var(--accent)" strokeWidth="2" />
            <circle cx="12" cy="12" r="3.5" fill="var(--sun)" />
          </svg>
          <span>Pio</span>
        </Link>
        <nav className="links" aria-label="Main">
          <Link href={`${base}#story`}>{t.story}</Link>
          <Link href={`${base}#classes`}>{t.classes}</Link>
          <Link href={`${base}/program`}>{t.program}</Link>
          <Link href={`${base}/video`}>{t.video}</Link>
          <Link href={`${base}#contact`}>{t.contact}</Link>
        </nav>
        <LangSwitch locale={locale} label={t.langLabel} />
      </div>
    </header>
  );
}
