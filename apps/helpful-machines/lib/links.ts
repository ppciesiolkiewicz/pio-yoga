import type { NavItem } from "@repo/ui/NavLinks";
import type { CtaLink } from "@repo/ui/SmartLink";
import { localizedPath, type Locale } from "@repo/web/locale";
import type { Content } from "@/content";
import { site } from "@/site.config";

/** Cal.com when configured for the market (new tab, tracked as booking_opened), otherwise the contact page. */
export function bookingLink(locale: Locale, t: Content, location: string): CtaLink {
  const url = site.calUrl.en;
  return url
    ? { href: url, label: t.nav.cta, external: true, track: "booking_opened", trackLocation: location }
    : { href: localizedPath(locale, "/contact"), label: t.nav.cta, track: "cta_click", trackLocation: location };
}

export function navItems(locale: Locale, t: Content): NavItem[] {
  // The landing page holds these sections, so the nav scrolls to them rather than opening separate pages.
  const home = localizedPath(locale, "/");
  const items: [string, string][] = [
    ["#services", t.nav.services],
    ["#how-it-works", t.nav.howItWorks],
    ["#pricing", t.nav.pricing],
  ];
  return items.map(([hash, label]) => ({ href: `${home}${hash}`, label }));
}

export function footerLinks(locale: Locale, t: Content): NavItem[] {
  return [
    { href: localizedPath(locale, "/privacy"), label: t.footer.privacy },
    { href: localizedPath(locale, "/terms"), label: t.footer.terms },
  ];
}
