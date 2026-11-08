import Image from "next/image";
import { Section } from "@repo/ui/Section";
import type { Content } from "@/content";
import { LinesDecor } from "@/components/LinesDecor";
import { linkedIn } from "@/components/Career";

/** Home-page strip that puts a face to the business and links to the full career section on the pricing page. */
export function Founder({ t, careerHref }: { t: Content; careerHref: string }) {
  const f = t.founder;
  return (
    <Section id="founder" className="hm-band" eyebrow={f.eyebrow} title={f.title} decor={<LinesDecor variant="founder" />}>
      <div className="flex max-w-3xl flex-col gap-6 sm:flex-row sm:items-start">
        <Image
          src="/images/founder.jpg"
          alt={f.photoAlt}
          width={160}
          height={160}
          className="size-32 shrink-0 rounded-full object-cover sm:size-40"
        />
        <div>
          <p className="font-display text-xl font-bold">{f.name}</p>
          <p className="text-sm font-bold text-muted">{f.role}</p>
          <p className="mt-3 text-lg text-muted">{f.body}</p>
          <p className="mt-3 flex flex-wrap gap-x-6">
            <a href={careerHref} className="inline-flex min-h-11 items-center font-bold underline decoration-2 underline-offset-4">
              {f.link}
            </a>
            <a href={linkedIn} rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-bold underline decoration-2 underline-offset-4">
              {t.career.link}
            </a>
          </p>
        </div>
      </div>
    </Section>
  );
}
