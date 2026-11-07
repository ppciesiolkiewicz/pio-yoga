import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "./Card";

export function ServiceCard({
  title,
  summary,
  href,
  linkLabel,
  icon,
  headingLevel: Heading = "h3",
}: {
  title: string;
  summary: string;
  href: string;
  linkLabel: string;
  /** Optional decorative icon shown above the title. */
  icon?: ReactNode;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Card className="relative flex h-full flex-col transition-transform focus-within:-translate-y-1 hover:-translate-y-1">
      {icon ? (
        <div aria-hidden="true" className="mb-5">
          {icon}
        </div>
      ) : null}
      <Heading className="service-card-title font-display text-xl font-extrabold">
        <Link href={href} className="no-underline after:absolute after:inset-0 after:content-['']">
          {title}
        </Link>
      </Heading>
      <p className="service-card-summary mt-3 text-muted">{summary}</p>
      <p aria-hidden="true" className="mt-auto pt-6 font-bold">
        {linkLabel} →
      </p>
    </Card>
  );
}
