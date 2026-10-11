import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "./Container";
import type { NavItem } from "./NavLinks";

export function SiteFooter({
  brand,
  tagline,
  nav,
  navLabel,
  email,
  legal,
  legalLinks,
  languageLink,
  extra,
}: {
  brand: ReactNode;
  tagline: string;
  nav: NavItem[];
  navLabel: string;
  email: { label: string; address: string };
  legal: string;
  legalLinks: NavItem[];
  languageLink?: ReactNode;
  extra?: ReactNode;
}) {
  const link = "inline-flex min-h-11 items-center underline-offset-4 hover:underline";
  return (
    <footer className="mt-10 border-t-2 border-line">
      <Container className="grid gap-10 py-12 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-extrabold">{brand}</p>
          <p className="mt-3 max-w-xs text-muted">{tagline}</p>
        </div>
        <nav aria-label={navLabel}>
          <ul className="grid">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="grid content-start gap-2">
          <p>
            {email.label}:{" "}
            <a href={`mailto:${email.address}`} className="font-bold underline underline-offset-4">
              {email.address}
            </a>
          </p>
          {languageLink && <p>{languageLink}</p>}
        </div>
      </Container>
      <Container className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t-2 border-line py-4 text-sm text-muted">
        <span>{legal}</span>
        {legalLinks.map((item) => (
          <Link key={item.href} href={item.href} className={link}>
            {item.label}
          </Link>
        ))}
        {extra}
      </Container>
    </footer>
  );
}
