import Image from "next/image";
import { Card } from "@repo/ui/Card";
import { Section } from "@repo/ui/Section";
import type { Content } from "@/content";

export const linkedIn ="https://www.linkedin.com/in/piotr-ciesiolkiewicz";

/** Who does the work: Piotr's career highlights, shown on the pricing page. */
export function Career({ t }: { t: Content }) {
  return (
    <Section id="career" eyebrow={t.career.eyebrow} title={t.career.title} intro={t.career.intro}>
      <div className="flex items-center gap-4">
        <Image
          src="/images/founder.jpg"
          alt={t.founder.photoAlt}
          width={96}
          height={96}
          className="size-20 rounded-full object-cover sm:size-24"
        />
        <div>
          <p className="font-display text-lg font-bold">{t.founder.name}</p>
          <p className="text-sm font-bold text-muted">{t.founder.role}</p>
          <a href={linkedIn} rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-bold underline decoration-2 underline-offset-4">
            {t.career.link}
          </a>
        </div>
      </div>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {t.career.highlights.map((item) => (
          <li key={item.title}>
            <Card className="h-full">
              <p className="font-display text-xl font-bold">{item.title}</p>
              <p className="mt-2 text-muted">{item.body}</p>
              {item.url && (
                <a href={item.url} rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center font-bold underline decoration-2 underline-offset-4">
                  {item.url.replace(/^https?:\/\//, "")}
                </a>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
