import Link from "next/link";
import { localizedPath, type Locale } from "@repo/web/locale";
import type { Content } from "@/content";

export function Breadcrumbs({ items, label }: { items: { name: string; href?: string }[]; label: string }) {
  return (
    <nav aria-label={label} className="text-sm">
      <ol className="flex flex-wrap items-center gap-2 text-muted">
        {items.map((item, index) => (
          <li key={item.name} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="inline-flex min-h-11 items-center underline underline-offset-4">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="font-bold text-ink">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** "Home / …" trail at the top of every page below the home page, so the way back is always one tap away. */
export function PageBreadcrumbs({
  locale,
  t,
  trail,
}: {
  locale: Locale;
  t: Content;
  trail: { name: string; href?: string }[];
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
      <Breadcrumbs label={t.nav.breadcrumbs} items={[{ name: t.nav.home, href: localizedPath(locale, "/") }, ...trail]} />
    </div>
  );
}
