import { Card } from "@repo/ui/Card";
import { ContactForm } from "@repo/ui/ContactForm";
import { Section } from "@repo/ui/Section";
import { ButtonLink } from "@repo/ui/SmartLink";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";
import { site } from "@/site.config";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/contact", t.meta.contact.title, t.meta.contact.description);
}

export default async function ContactPage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  const booking = bookingLink(locale, t, "contact");
  return (
    <Section id="contact" headingLevel="h1" eyebrow={t.contact.eyebrow} title={t.contact.title} intro={t.contact.intro}>
      <div className="grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-start">
        {booking.external && (
          <Card>
            <h2 className="font-display text-2xl font-bold">{t.contact.bookTitle}</h2>
            <p className="mt-2 text-muted">{t.contact.bookBody}</p>
            <div className="mt-6">
              <ButtonLink link={booking} newTabLabel={t.nav.newTab} />
            </div>
          </Card>
        )}
        <Card className={booking.external ? undefined : "md:col-span-2"}>
          <h2 className="font-display text-2xl font-bold">{t.contact.formTitle}</h2>
          <div className="mt-6">
            <ContactForm locale={locale} labels={t.contact.form} email={site.contactEmail} />
          </div>
        </Card>
      </div>
    </Section>
  );
}
