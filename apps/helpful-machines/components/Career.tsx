import { Card } from "@repo/ui/Card";
import { Section } from "@repo/ui/Section";
import type { Content } from "@/content";

const linkedIn = "https://www.linkedin.com/in/piotr-ciesiolkiewicz";

/** Who does the work: Piotr's career highlights, shown on the home and pricing pages. */
export function Career({ t }: { t: Content }) {
  return (
    <Section id="career" eyebrow={t.career.eyebrow} title={t.career.title} intro={t.career.intro}>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {t.career.highlights.map((item) => (
          <li key={item.title}>
            <Card className="h-full">
              <p className="font-display text-xl font-bold">{item.title}</p>
              <p className="mt-2 text-muted">{item.body}</p>
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-8">
        <a href={linkedIn} rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-bold underline decoration-2 underline-offset-4">
          {t.career.link}
        </a>
      </p>
    </Section>
  );
}
