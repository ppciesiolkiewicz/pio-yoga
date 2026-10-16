import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { bookingHref, site } from "@/lib/site";
import BreathCircle from "@/components/BreathCircle";
import CopyEmail from "@/components/CopyEmail";
import JsonLd from "@/components/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return { ...pageMetadata(locale, "", t.meta.title, t.meta.description), title: { absolute: t.meta.title } };
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const booking = bookingHref(locale);
  const external = booking.startsWith("http");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Pio",
    url: `${site.url}/${locale}`,
    email: site.email,
    jobTitle: ["Yoga teacher", "Thai yoga massage therapist", "Vocal and music trainer", "Contemporary dancer", "Circus artist"],
    knowsLanguage: ["en", "pl"],
    hasCredential: t.story.creds.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      name: c.title,
      recognizedBy: { "@type": "Organization", name: c.place },
    })),
    makesOffer: [
      ...t.classes.items.map((c) => c.title),
      t.classes.thai.title,
      t.program.eyebrow,
      t.video.eyebrow,
      ...t.beyond.items.map((b) => b.title),
    ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="hero">
        <div>
          <div className="eyebrow">{t.hero.eyebrow}</div>
          <h1>
            {t.hero.titleA}
            <em>{t.hero.titleEm}</em>
            {t.hero.titleB}
          </h1>
          <p className="lead">{t.hero.lead}</p>
          <div className="ctas">
            <a className="btn primary" href={booking} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
              {t.hero.cta1}
            </a>
            <a className="btn" href="#story">{t.hero.cta2}</a>
          </div>
          <p className="small">{t.hero.langs}</p>
        </div>
        <BreathCircle t={t.breath} />
      </section>

      <section id="story" className="story">
        <div>
          <div className="eyebrow">{t.story.eyebrow}</div>
          <h2>{t.story.title}</h2>
          <figure className="bone">
            <svg viewBox="0 0 300 90" aria-hidden="true">
              <path d="M18 58 C 60 70, 95 30, 140 38 S 230 66, 282 30" fill="none" stroke="var(--ink)" strokeWidth="11" strokeLinecap="round" />
              <path d="M18 58 C 60 70, 95 30, 140 38 S 230 66, 282 30" fill="none" stroke="var(--bg)" strokeWidth="5" strokeLinecap="round" />
              <g stroke="var(--sun)" strokeWidth="2.5" strokeLinecap="round">
                <path d="M150 24 L146 54" />
                <path d="M140 28 L156 30" />
                <path d="M138 40 L158 42" />
                <path d="M136 52 L156 54" />
              </g>
            </svg>
            <figcaption>{t.story.fig}</figcaption>
          </figure>
        </div>
        <div className="text">
          <p>{t.story.p1}</p>
          <p>{t.story.p2}</p>
          <p>{t.story.p3}</p>
          <p className="note">{t.story.note}</p>
          <div className="creds">
            <div className="eyebrow">{t.story.credEyebrow}</div>
            {t.story.creds.map((c) => (
              <div className="cred" key={c.title}>
                <strong>{c.title}</strong>
                <span>{c.place}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="classes">
        <div className="sec-head">
          <div className="eyebrow">{t.classes.eyebrow}</div>
          <h2>{t.classes.title}</h2>
          <p className="lead">{t.classes.lead}</p>
        </div>
        <div className="classes">
          {t.classes.items.map((c, i) => (
            <article className={`class${i === 0 ? " feature" : ""}`} key={c.title}>
              <div className="meta">{c.meta}</div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </article>
          ))}
          <article className="class thai">
            <div>
              <div className="meta">{t.classes.thai.meta}</div>
              <h3>{t.classes.thai.title}</h3>
            </div>
            <div className="thai-text">
              <p>{t.classes.thai.body}</p>
              <p className="cred-inline">{t.classes.thai.cred}</p>
            </div>
          </article>
        </div>
      </section>

      <section className="offers">
        <Link className="offer" href={`/${locale}/program`}>
          <div className="eyebrow">{t.program.eyebrow}</div>
          <h2>{t.program.title}</h2>
          <p>{t.program.teaser}</p>
          <span className="arrow">{t.program.teaserCta} →</span>
        </Link>
        <Link className="offer alt" href={`/${locale}/video`}>
          <div className="eyebrow">
            {t.video.eyebrow} <span className="badge">{t.video.badge}</span>
          </div>
          <h2>{t.video.title}</h2>
          <p>{t.video.teaser}</p>
          <span className="arrow">{t.video.teaserCta} →</span>
        </Link>
        <Link className="offer wide" href={`/${locale}/timer`}>
          <div className="eyebrow">{t.timer.eyebrow}</div>
          <p>{t.timer.teaser}</p>
          <span className="arrow">{t.timer.teaserCta} →</span>
        </Link>
      </section>

      <section id="beyond">
        <div className="sec-head">
          <div className="eyebrow">{t.beyond.eyebrow}</div>
          <h2>{t.beyond.title}</h2>
          <p className="lead">{t.beyond.lead}</p>
        </div>
        <div className="disc">
          {t.beyond.items.map((d) => (
            <div className="disc-row" key={d.title}>
              <div>
                <h3>{d.title}</h3>
                <p className="link">{d.link}</p>
              </div>
              <p className="body">{d.body}</p>
            </div>
          ))}
        </div>
        <p className="combine">{t.beyond.combine}</p>
      </section>

      <section className="two">
        <div>
          <div className="eyebrow">{t.how.eyebrow}</div>
          <div className="principles">
            {t.how.items.map((h) => (
              <div key={h.title}>
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="who">
          <h2>{t.how.whoTitle}</h2>
          <ul className="dots">
            {t.how.who.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section id="contact" className="contact">
        <div className="eyebrow">{t.contact.eyebrow}</div>
        <h2>{t.contact.title}</h2>
        <p className="lead">{t.contact.lead}</p>
        <CopyEmail email={site.email} copy={t.contact.copy} copied={t.contact.copied} />
        {site.bookingUrl && (
          <div>
            <a className="btn primary" href={site.bookingUrl} target="_blank" rel="noopener">
              {t.contact.book}
            </a>
          </div>
        )}
        <div className="facts">
          <span>{t.contact.where}</span>
          <span>English · Polski</span>
        </div>
      </section>
    </>
  );
}
