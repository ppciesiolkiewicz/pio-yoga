import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { bookingHref, site } from "@/lib/site";
import BreathCircle from "@/components/BreathCircle";
import CopyEmail from "@/components/CopyEmail";
import JsonLd from "@/components/JsonLd";
import PracticeWeb from "@/components/PracticeWeb";
import TimerIcon from "@/components/TimerIcon";

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
    jobTitle: ["Yoga teacher", "Thai yoga massage therapist", "Vocal and music trainer", "Contemporary dancer", "Circus artist", "Meditation teacher"],
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
            <a className="btn" href="#practice">{t.hero.cta2}</a>
          </div>
          <p className="small">{t.hero.langs}</p>
        </div>
        <BreathCircle t={t.breath} />
      </section>

      <section id="practice">
        <div className="sec-head">
          <div className="eyebrow">{t.practice.eyebrow}</div>
          <h2>{t.practice.title}</h2>
          <p className="lead">{t.practice.lead}</p>
        </div>
        <div className="web-wrap">
          <PracticeWeb centre={t.practice.centre} labels={t.practice.items.map((i) => i.short)} />
          <div>
            <h3 className="h-xs">{t.practice.threadsTitle}</h3>
            <div className="principles threads">
              {t.practice.threads.map((th) => (
                <div key={th.title}>
                  <h4>{th.title}</h4>
                  <p>{th.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <h3 className="h-xs sub">{t.practice.itemsTitle}</h3>
        <div className="practices">
          {t.practice.items.map((it) => (
            <article className="class" key={it.title}>
              <div className="meta">{it.tag}</div>
              <h4>{it.title}</h4>
              <p>{it.body}</p>
            </article>
          ))}
        </div>
        <div className="well">
          <h3 className="h-xs">{t.practice.wellTitle}</h3>
          <div className="well-grid">
            {t.practice.well.map((w) => (
              <div key={w.title}>
                <strong>{w.title}</strong>
                <p>{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="story" className="story">
        <div>
          <div className="eyebrow">{t.story.eyebrow}</div>
          <h2>{t.story.title}</h2>
          <figure className="bone">
            <svg viewBox="0 0 300 90" aria-hidden="true">
              <path d="M6 45 C 30 10, 54 10, 78 45 S 126 80, 150 45 S 198 10, 222 45 S 270 80, 294 45" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
              <path d="M6 45 C 30 25, 54 25, 78 45 S 126 65, 150 45 S 198 25, 222 45 S 270 65, 294 45" fill="none" stroke="var(--sun)" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 6" />
              <g fill="var(--sun)">
                <circle cx="78" cy="45" r="4" />
                <circle cx="150" cy="45" r="4" />
                <circle cx="222" cy="45" r="4" />
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

      <section id="meditation" className="two">
        <div>
          <div className="eyebrow">{t.mindful.eyebrow}</div>
          <h2 className="h-mid">{t.mindful.title}</h2>
          <p className="lead">{t.mindful.lead}</p>
          <div className="ctas">
            <Link className="btn" href={`/${locale}/timer`}>{t.mindful.cta} →</Link>
          </div>
        </div>
        <div className="principles quiet">
          {t.mindful.items.map((m) => (
            <div key={m.title}>
              <h3>{m.title}</h3>
              <p>{m.body}</p>
            </div>
          ))}
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
        <Link className="offer wide app-tile" href={`/${locale}/timer`}>
          <span className="app-disc">
            <TimerIcon />
          </span>
          <div className="app-text">
            <div className="eyebrow">{t.timer.eyebrow}</div>
            <p>{t.timer.teaser}</p>
          </div>
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
