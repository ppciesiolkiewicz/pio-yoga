import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { bookingHref, site } from "@/lib/site";
import JsonLd from "@/components/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata(locale, "/program", t.meta.programTitle, t.meta.programDescription);
}

export default async function ProgramPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const p = t.program;
  const booking = bookingHref(locale);
  const external = booking.startsWith("http");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: p.eyebrow,
          description: t.meta.programDescription,
          url: `${site.url}/${locale}/program`,
          provider: { "@type": "Person", name: "Pio" },
          availableLanguage: ["en", "pl"],
        }}
      />

      <section className="page-head">
        <div className="eyebrow">{p.eyebrow}</div>
        <h1>{p.title}</h1>
        <p className="lead">{p.lead}</p>
        <div className="ctas">
          <a className="btn primary" href={booking} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
            {p.cta}
          </a>
        </div>
      </section>

      <section>
        <div className="sec-head">
          <h2>{p.includesTitle}</h2>
        </div>
        <div className="modalities">
          {p.modalities.map((m) => (
            <article className="class" key={m.name}>
              <div className="meta">{m.tag}</div>
              <h3>{m.name}</h3>
              <p>{m.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="sec-head">
          <h2>{p.compareTitle}</h2>
        </div>
        <div className="table-wrap">
          <table className="compare">
            <thead>
              <tr>
                <td />
                {p.modalities.map((m) => (
                  <th scope="col" key={m.name}>{m.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.compareRows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.values.map((v, i) => (
                    <td key={i}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="two">
        <div>
          <h2 className="h-sm">{p.learnTitle}</h2>
          <ul className="dots">
            {p.learn.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
        <aside className="who">
          <h2>{p.formatTitle}</h2>
          <p>{p.format}</p>
          <a className="btn primary" href={booking} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
            {p.cta}
          </a>
        </aside>
      </section>
    </>
  );
}
