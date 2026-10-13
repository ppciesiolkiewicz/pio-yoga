import Link from "next/link";
import type { ReactNode } from "react";
import { ColorModeSwitch, type ColorModeLabels } from "./ColorModeSwitch";
import { Container } from "./Container";
import { MobileMenu } from "./MobileMenu";
import { NavLinks, type NavItem } from "./NavLinks";
import { ButtonLink, type CtaLink } from "./SmartLink";

export function SiteHeader({
  brand,
  homeHref,
  nav,
  buckets,
  cta,
  labels,
  newTabLabel,
}: {
  brand: ReactNode;
  homeHref: string;
  nav: NavItem[];
  buckets: readonly string[];
  cta: CtaLink;
  labels: { primary: string; menu: string; close: string; colorMode: ColorModeLabels };
  newTabLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-line bg-bg">
      <Container className="flex min-h-16 items-center justify-between gap-4 py-2">
        <Link href={homeHref} className="flex min-h-11 items-center gap-2 font-display text-lg font-extrabold no-underline">
          {brand}
        </Link>
        <nav aria-label={labels.primary} className="hidden lg:block">
          <NavLinks items={nav} buckets={buckets} />
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <ColorModeSwitch labels={labels.colorMode} />
          </div>
          {/* Wrapper, not a class on the link: the button's own inline-flex would override "hidden". */}
          <div className="hidden sm:block">
            <ButtonLink link={{ ...cta, trackLocation: "header" }} newTabLabel={newTabLabel} />
          </div>
          <MobileMenu items={nav} buckets={buckets} cta={cta} labels={labels} newTabLabel={newTabLabel} />
        </div>
      </Container>
    </header>
  );
}
