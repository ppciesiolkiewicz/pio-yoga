import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";
import { buttonClasses, type Variant } from "./Button";

export type CtaLink = { href: string; label: string; external?: boolean; track?: string; trackLocation?: string };

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  external?: boolean;
  track?: string;
  trackLocation?: string;
  newTabLabel?: string;
  children: ReactNode;
};

export function SmartLink({ href, external, track, trackLocation, newTabLabel = "(opens in a new tab)", children, className, ...rest }: Props) {
  const data = { "data-track": track, "data-track-location": trackLocation };
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...data} {...rest}>
        {children}
        <span className="sr-only"> {newTabLabel}</span>
      </a>
    );
  }
  return (
    <Link href={href} className={className} {...data} {...rest}>
      {children}
    </Link>
  );
}

export function ButtonLink({ link, variant = "primary", newTabLabel, className }: { link: CtaLink; variant?: Variant; newTabLabel?: string; className?: string }) {
  return (
    <SmartLink
      href={link.href}
      external={link.external}
      track={link.track}
      trackLocation={link.trackLocation}
      newTabLabel={newTabLabel}
      className={cn(buttonClasses(variant), className)}
    >
      {link.label}
    </SmartLink>
  );
}
