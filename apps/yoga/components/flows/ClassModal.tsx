"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { classes, related } from "@/content/flows";
import { PHASE_LABEL, PartView, groupByPhase } from "@/components/flows/FlowParts";
import ClassCircle from "@/components/flows/ClassCircle";

// One class at a time: the selected class renders in a modal dialog. Opening it adds a
// history entry, so the browser/phone Back button closes it and returns to the notebook.
const OpenClass = createContext<(slug: string) => void>(() => {});

const MODAL_STATE = "clsModal";
const inModalEntry = () => typeof history !== "undefined" && history.state?.[MODAL_STATE] === true;

export function ClassModalProvider({ children }: { children: React.ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  // Hash to jump to once the modal's history entry has been popped.
  const pendingHash = useRef<string | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (slug && !d.open) {
      d.showModal();
      if (!inModalEntry()) history.pushState({ ...history.state, [MODAL_STATE]: true }, "");
    }
    if (!slug && d.open) d.close();
    d.scrollTop = 0;
  }, [slug]);

  useEffect(() => {
    const onPop = () => {
      if (inModalEntry()) return;
      if (ref.current?.open) ref.current.close();
      const hash = pendingHash.current;
      pendingHash.current = null;
      if (hash) location.hash = hash;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const index = slug ? classes.findIndex((c) => c.slug === slug) : -1;

  return (
    <OpenClass.Provider value={setSlug}>
      {children}
      <dialog
        ref={ref}
        className="cls-modal"
        aria-label={index >= 0 ? classes[index].title : "Class"}
        onClose={() => {
          setSlug(null);
          // Closed by ✕, Esc or backdrop: drop the modal's history entry too.
          if (inModalEntry()) history.back();
          else if (pendingHash.current) {
            location.hash = pendingHash.current;
            pendingHash.current = null;
          }
        }}
        onClick={(e) => {
          const d = ref.current;
          const t = e.target as HTMLElement;
          if (!d) return;
          if (t === e.currentTarget) return d.close(); // backdrop
          // A jump to something on the page underneath (e.g. a building block): close first, then go.
          const a = t.closest<HTMLAnchorElement>('a[href^="#"]');
          const hash = a?.getAttribute("href");
          if (!hash || d.contains(document.getElementById(hash.slice(1)))) return;
          e.preventDefault();
          pendingHash.current = hash;
          d.close();
        }}
      >
        {index >= 0 && <ClassView index={index} />}
      </dialog>
    </OpenClass.Provider>
  );
}

/** A button that opens a class in the modal. */
export function ClassLink({
  slug,
  className = "lnk",
  children,
}: {
  slug: string;
  className?: string;
  children: React.ReactNode;
}) {
  const open = useContext(OpenClass);
  return (
    <button type="button" className={className} onClick={() => open(slug)}>
      {children}
    </button>
  );
}

function ClassView({ index }: { index: number }) {
  const c = classes[index];
  const rel = related(c);
  const groups = groupByPhase(c.parts);
  const parts = groups.reduce((sum, g) => sum + g.items.filter((it) => it.n !== null).length, 0);
  return (
    <article className="cls">
      <form method="dialog" className="cls-modal-bar">
        <button type="submit" className="cls-modal-back">
          ← Notebook
        </button>
        <button type="submit" className="cls-modal-close" aria-label="Close">
          ✕
        </button>
      </form>
      <header className="cls-head">
        <div className="cls-head-text">
          <div className="eyebrow">Class {index + 1}</div>
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
        <ClassCircle slug={c.slug} groups={groups} centre={[`${parts} parts`, c.duration ?? `${groups.length} phases`]} />
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

      {rel.length > 0 && (
        <footer className="cls-foot">
          <div className="rel">
            <span className="rel-label">Related</span>
            <ul>
              {rel.map((r) => (
                <li key={r.cls.slug}>
                  <ClassLink slug={r.cls.slug}>{r.cls.title}</ClassLink>
                  <span className="rel-why">{r.reasons.slice(0, 3).join(" · ")}</span>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      )}
    </article>
  );
}
