import Link from "next/link";
import { Card } from "./Card";

export function ServiceCard({
  title,
  summary,
  href,
  linkLabel,
  headingLevel: Heading = "h3",
}: {
  title: string;
  summary: string;
  href: string;
  linkLabel: string;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Card className="relative flex h-full flex-col transition-transform focus-within:-translate-y-1 hover:-translate-y-1">
      <Heading className="font-display text-xl font-extrabold">
        <Link href={href} className="no-underline after:absolute after:inset-0 after:content-['']">
          {title}
        </Link>
      </Heading>
      <p className="mt-3 text-muted">{summary}</p>
      <p aria-hidden="true" className="mt-auto pt-6 font-bold">
        {linkLabel} →
      </p>
    </Card>
  );
}
