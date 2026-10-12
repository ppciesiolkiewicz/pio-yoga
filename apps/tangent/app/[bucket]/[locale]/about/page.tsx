import { Card } from "@repo/ui/Card";
import { CtaBand } from "@repo/ui/CtaBand";
import { JsonLd } from "@repo/ui/JsonLd";
import { PersonCard } from "@repo/ui/PersonCard";
import { Section } from "@repo/ui/Section";
import { person } from "@repo/web/json-ld";
import { visiblePeople } from "@/content/people";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/about", t.meta.about.title, t.meta.about.description);
}

export default async function AboutPage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  const team = visiblePeople();
  return (
    <>
      <Section id="about" headingLevel="h1" eyebrow={t.about.eyebrow} title={t.about.title} intro={t.about.intro}>
        <div className="grid max-w-3xl gap-4 text-lg">
          {t.about.story.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <section aria-labelledby="education-title">
            <h2 id="education-title" className="font-display text-2xl font-bold">
              {t.about.educationTitle}
            </h2>
            <ul className="mt-4 grid gap-4">
              {t.about.education.map((entry) => (
                <li key={entry.degree}>
                  <Card>
                    <p className="font-bold">{entry.degree}</p>
                    <p>{entry.school}</p>
                    <p className="mt-1 text-sm text-muted">{entry.detail}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="awards-title">
            <h2 id="awards-title" className="font-display text-2xl font-bold">
              {t.about.awardsTitle}
            </h2>
            <ul className="mt-4 grid gap-4">
              {t.about.awards.map((award) => (
                <li key={award.title}>
                  <Card>
                    <p className="font-bold">{award.title}</p>
                    <p className="mt-1 text-muted">{award.body}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Section>
      <Section id="people" title={t.about.peopleTitle} intro={t.about.peopleIntro}>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <li key={member.id}>
              <PersonCard
                name={member.name}
                role={t.people.items[member.id].role}
                bio={t.people.items[member.id].bio}
                photo={member.photo ? { src: member.photo.src, alt: member.name } : undefined}
                links={member.links}
              />
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
      <JsonLd
        data={team.map((member) =>
          person({
            name: member.name,
            jobTitle: t.people.items[member.id].role,
            sameAs: member.links.map((link) => link.href),
            alumniOf: member.id === "piotr" ? ["Wrocław University of Science and Technology"] : undefined,
            award: member.id === "piotr" ? t.about.awards.map((award) => award.title) : undefined,
          }),
        )}
      />
    </>
  );
}
