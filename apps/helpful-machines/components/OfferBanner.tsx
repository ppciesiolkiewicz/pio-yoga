import { SmartLink } from "@repo/ui/SmartLink";

/** Site-wide strip above the header that points every visitor at the new-client offer. */
export function OfferBanner({
  headline,
  detail,
  link,
}: {
  headline: string;
  detail: string;
  link: { href: string; label: string };
}) {
  return (
    <aside aria-label={link.label} className="bg-highlight text-ink">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-0.5 px-4 py-2 text-center font-display text-sm sm:text-base">
        <p className="font-extrabold">{headline}</p>
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span>{detail}</span>
          <SmartLink href={link.href} track="cta_click" trackLocation="offer_banner" className="underline decoration-2 underline-offset-4">
            {link.label} <span aria-hidden="true">→</span>
          </SmartLink>
        </p>
      </div>
    </aside>
  );
}
