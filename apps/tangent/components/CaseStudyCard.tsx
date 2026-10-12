import Link from "next/link";
import { Card } from "@repo/ui/Card";
import { localizedPath, type Locale } from "@repo/web/locale";
import type { Content } from "@/content";
import type { WorkSlug } from "@/content/work";

export function CaseStudyCard({
  slug,
  locale,
  item,
  readMore,
  headingLevel: Heading = "h3",
}: {
  slug: WorkSlug;
  locale: Locale;
  item: Content["work"]["items"][WorkSlug];
  readMore: string;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Card as="article" className="relative flex h-full flex-col transition-transform focus-within:-translate-y-1 hover:-translate-y-1">
      <p className="text-sm font-bold uppercase tracking-widest text-accent-text">
        {item.sector} · {item.period}
      </p>
      <Heading className="mt-2 font-display text-xl font-bold">
        <Link href={localizedPath(locale, `/work/${slug}`)} className="no-underline after:absolute after:inset-0 after:content-['']">
          {item.title}
        </Link>
      </Heading>
      <p className="mt-3 text-muted">{item.summary}</p>
      <p className="mt-auto flex justify-between gap-4 pt-6 text-sm font-bold">
        <span>{item.client}</span>
        <span aria-hidden="true">{readMore} →</span>
      </p>
    </Card>
  );
}
