import Link from "next/link";
import type { PieceCategory } from "@/content/flows";
import { byFocus, byPeak, classes, isUse, pieces, practiceList, related, usedIn } from "@/content/flows";
import { PHASES, PHASE_LABEL, PartView, StepView, groupByPhase } from "@/components/flows/FlowParts";
import ClassCircle from "@/components/flows/ClassCircle";

const ladderCount =
  pieces.filter((p) => p.category === "ladder").length +
  classes.flatMap((c) => c.parts).filter((p) => !isUse(p) && p.kind === "ladder").length;

const CATEGORY_LABEL: Record<PieceCategory, string> = {
  warmup: "Warm-ups",
  sun: "Sun salutations",
  drill: "Drills",
  standing: "Standing sequences",
  ladder: "Ladders",
  core: "Core",
  closing: "Closing",
};
const CATEGORY_ORDER: PieceCategory[] = ["warmup", "sun", "drill", "standing", "ladder", "core", "closing"];

function ClassLinks({ list }: { list: { slug: string; title: string }[] }) {
  return (
    <span className="cls-links">
      {list.map((c, i) => (
        <span key={c.slug}>
          {i > 0 && ", "}
          <a href={`#${c.slug}`}>{c.title}</a>
        </span>
      ))}
    </span>
  );
}

export default function FlowNotebook() {
  const peaks = byPeak();
  const focus = byFocus();

  return (
    <div className="fl">
      <header className="fl-bar">
        <div className="wrap">
          <span className="fl-mark">Pio · Flow notebook</span>
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
            {PHASES.map((p) => (
              <li key={p} data-phase={p}>
                <span className="lg-phase" /> {PHASE_LABEL[p]}
              </li>
            ))}
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
              <a className="cls-card" href={`#${c.slug}`} key={c.slug}>
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
              </a>
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

        {classes.map((c, i) => {
          const rel = related(c);
          const groups = groupByPhase(c.parts);
          const parts = groups.reduce((sum, g) => sum + g.items.filter((it) => it.n !== null).length, 0);
          return (
            <article className="cls" id={c.slug} key={c.slug}>
              <header className="cls-head">
                <div className="cls-head-text">
                <div className="eyebrow">Class {i + 1}</div>
                <h2>{c.title}</h2>
                {c.subtitle && <p className="cls-sub">{c.subtitle}</p>}
                <div className="chips">
                  {c.duration && <span className="chip chip-time">{c.duration}</span>}
                  {c.peaks.map((p) => (
                    <span className="chip chip-peak" key={p}>
                      Peak: {p}
                    </span>
                  ))}
                  {c.focus.map((f) => (
                    <span className="chip" key={f}>
                      {f}
                    </span>
                  ))}
                </div>
                {c.note && <p className="cls-note">{c.note}</p>}
                </div>
                <ClassCircle
                  slug={c.slug}
                  groups={groups}
                  centre={[`${parts} parts`, c.duration ?? `${groups.length} phases`]}
                />
              </header>

              <div className="phases">
                {groups.map((g, gi) => {
                  const nums = g.items.flatMap((it) => (it.n === null ? [] : [it.n]));
                  return (
                    <section className="phase" data-phase={g.phase} key={gi}>
                      <h3 className="phase-head">
                        <span className="phase-bar" aria-hidden="true" />
                        {PHASE_LABEL[g.phase]}
                        {nums.length > 0 && (
                          <span className="phase-range">
                            {nums.length > 1 ? `${nums[0]}–${nums[nums.length - 1]}` : nums[0]}
                          </span>
                        )}
                      </h3>
                      <ol className="seq">
                        {g.items.map((it, j) => (
                          <li
                            key={j}
                            id={it.n === null ? undefined : `${c.slug}-${it.n}`}
                            data-type={it.type}
                            className={it.n === null ? "is-vin" : undefined}
                          >
                            <span className="node" aria-hidden="true">
                              {it.n}
                            </span>
                            <PartView part={it.part} />
                          </li>
                        ))}
                      </ol>
                    </section>
                  );
                })}
              </div>

              <footer className="cls-foot">
                {rel.length > 0 && (
                  <div className="rel">
                    <span className="rel-label">Related</span>
                    <ul>
                      {rel.map((r) => (
                        <li key={r.cls.slug}>
                          <a href={`#${r.cls.slug}`}>{r.cls.title}</a>
                          <span className="rel-why">{r.reasons.slice(0, 3).join(" · ")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <a className="top-link" href="#top">
                  Back to top ↑
                </a>
              </footer>
            </article>
          );
        })}

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
    </div>
  );
}
