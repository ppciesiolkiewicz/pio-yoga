import Link from "next/link";
import type { PieceCategory } from "@/content/flows";
import { byFocus, byPeak, classes, isUse, partOf, pieces, practiceList, usedIn } from "@/content/flows";
import { StepView, groupByPhase } from "@/components/flows/FlowParts";
import ClassCircle from "@/components/flows/ClassCircle";
import { ClassLink, ClassModalProvider } from "@/components/flows/ClassModal";
import BackToTop from "@/components/flows/BackToTop";

const ladderCount =
  pieces.filter((p) => p.category === "ladder").length +
  classes.flatMap((c) => c.parts).filter((p) => !isUse(p) && p.kind === "ladder").length;

const CATEGORY_LABEL: Record<PieceCategory, string> = {
  warmup: "Warm-ups",
  sun: "Sun salutations",
  drill: "Drills",
  standing: "Standing sequences",
  interlude: "Interludes",
  ladder: "Ladders",
  core: "Core",
  closing: "Closing",
};
const CATEGORY_ORDER: PieceCategory[] = ["warmup", "sun", "drill", "standing", "interlude", "ladder", "core", "closing"];

function ClassLinks({ list }: { list: { slug: string; title: string }[] }) {
  return (
    <span className="cls-links">
      {list.map((c, i) => (
        <span key={c.slug}>
          {i > 0 && ", "}
          <ClassLink slug={c.slug}>{c.title}</ClassLink>
        </span>
      ))}
    </span>
  );
}

export default function FlowNotebook() {
  const peaks = byPeak();
  const focus = byFocus();

  return (
    <ClassModalProvider>
      <div className="fl">
        <header className="fl-bar">
          <div className="wrap">
            <a className="fl-mark" href="#top">
              Pio · Flow notebook
            </a>
            <nav aria-label="Notebook">
              <a href="#classes">Classes</a>
              <a href="#connections">Connections</a>
              <a href="#blocks">Building blocks</a>
              <a href="#practice">Practice</a>
            </nav>
            <Link href="/en" className="fl-site">
              Site ↗
            </Link>
          </div>
        </header>

        <main className="wrap">
          <section className="fl-hero" id="top">
            <div className="eyebrow">Private · not in the site menu · not indexed</div>
            <h1>Flow notebook</h1>
            <p className="lead">
              Your class plans from the notebook, in teaching order. Classes are built from reusable blocks, and focus
              and peak poses connect them.
            </p>
            <dl className="fl-stats">
              <div>
                <dt>Classes</dt>
                <dd>{classes.length}</dd>
              </div>
              <div>
                <dt>Building blocks</dt>
                <dd>{pieces.length}</dd>
              </div>
              <div>
                <dt>Ladders</dt>
                <dd>{ladderCount}</dd>
              </div>
            </dl>
            <ul className="legend" aria-label="Legend">
              <li>
                <span className="lg-dot new" /> new this round
              </li>
              <li>
                <span className="lg-dot repeat" /> repeated from the round before
              </li>
              <li>
                <span className="tag tag-optional">optional</span>
              </li>
              <li>
                <span className="tag tag-dynamic">dynamic</span>
              </li>
              <li>
                <span className="tag tag-peak">peak</span>
              </li>
              <li>
                <span className="tag tag-unsure">?</span> check my reading
              </li>
              <li>
                <span className="lg-bracket">×3</span> repeat the bracket
              </li>
            </ul>
          </section>

          <section id="classes" className="fl-sec">
            <h2 className="sec-title">Classes</h2>
            <div className="cls-grid">
              {classes.map((c) => (
                <ClassLink className="cls-card" slug={c.slug} key={c.slug}>
                  <ClassCircle slug={c.slug} groups={groupByPhase(c.parts)} variant="mini" />
                  <span className="cls-card-title">{c.title}</span>
                  {c.subtitle && <span className="cls-card-sub">{c.subtitle}</span>}
                  <span className="chips">
                    {c.duration && <span className="chip chip-time">{c.duration}</span>}
                    {c.peaks.map((p) => (
                      <span className="chip chip-peak" key={p}>
                        {p}
                      </span>
                    ))}
                    {c.focus.slice(0, 3).map((f) => (
                      <span className="chip" key={f}>
                        {f}
                      </span>
                    ))}
                  </span>
                </ClassLink>
              ))}
            </div>
          </section>

          <section id="connections" className="fl-sec">
            <h2 className="sec-title">Connections</h2>
            <div className="conn">
              <div>
                <h3 className="conn-title">By peak pose</h3>
                <dl className="conn-list">
                  {peaks.map(([p, list]) => (
                    <div key={p}>
                      <dt>{p}</dt>
                      <dd>
                        <ClassLinks list={list} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3 className="conn-title">By focus</h3>
                <dl className="conn-list">
                  {focus.map(([f, list]) => (
                    <div key={f}>
                      <dt>{f}</dt>
                      <dd>
                        <ClassLinks list={list} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          <section id="blocks" className="fl-sec">
            <h2 className="sec-title">Building blocks</h2>
            <p className="lead">Reusable pieces to mix into any class. Each one lists the classes that use it.</p>
            {CATEGORY_ORDER.map((cat) => {
              const list = pieces.filter((p) => p.category === cat);
              if (!list.length) return null;
              return (
                <div className="lib-cat" key={cat}>
                  <h3 className="lib-cat-title">{CATEGORY_LABEL[cat]}</h3>
                  <div className={cat === "ladder" ? "lib-grid lib-wide" : "lib-grid"}>
                    {list.map((p) => {
                      const used = usedIn(p.id);
                      return (
                        <article className="piece" id={`block-${p.id}`} key={p.id}>
                          <header className="piece-head">
                            <h4>{p.title}</h4>
                            {p.subtitle && <p className="cls-sub">{p.subtitle}</p>}
                            <p className="piece-used">
                              {used.length ? (
                                <>
                                  Used in <ClassLinks list={used} />
                                </>
                              ) : (
                                "Not in a class yet. Mix it in."
                              )}
                            </p>
                            {partOf(p.id).length > 0 && (
                              <p className="piece-used">
                                Part of{" "}
                                {partOf(p.id).map((o, i) => (
                                  <span key={o.id}>
                                    {i > 0 && ", "}
                                    <a href={`#block-${o.id}`}>{o.title}</a>
                                  </span>
                                ))}
                              </p>
                            )}
                            {p.note && <p className="bnote">{p.note}</p>}
                          </header>
                          {p.steps.map((s, i) => (
                            <StepView key={i} step={s} />
                          ))}
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>

          <section id="practice" className="fl-sec">
            <h2 className="sec-title">Practice list</h2>
            <p className="lead">Poses to keep working on in your own practice.</p>
            <ul className="practice">
              {practiceList.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        </main>
        <BackToTop />
      </div>
    </ClassModalProvider>
  );
}
