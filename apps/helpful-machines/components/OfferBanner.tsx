import { SmartLink } from "@repo/ui/SmartLink";

/** Site-wide strip above the header that points every visitor at the new-client offer. */
export function OfferBanner({ text, link }: { text: string; link: { href: string; label: string } }) {
  return (
    <aside aria-label={link.label} className="bg-highlight text-ink">
      <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center font-display font-bold">
        <span>{text}</span>
        <SmartLink href={link.href} track="cta_click" trackLocation="offer_banner" className="underline decoration-2 underline-offset-4">
          {link.label} <span aria-hidden="true">→</span>
        </SmartLink>
      </p>
    </aside>
  );
}
