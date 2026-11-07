"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { classes, related } from "@/content/flows";
import { PartView, partType } from "@/components/flows/FlowParts";

// One class at a time: the selected class lives in memory (no URL) and renders in a modal dialog.
const OpenClass = createContext<(slug: string) => void>(() => {});

export function ClassModalProvider({ children }: { children: React.ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (slug && !d.open) d.showModal();
    if (!slug && d.open) d.close();
    d.scrollTop = 0;
  }, [slug]);

  const index = slug ? classes.findIndex((c) => c.slug === slug) : -1;

  return (
    <OpenClass.Provider value={setSlug}>
      {children}
      <dialog
        ref={ref}
        className="cls-modal"
        aria-label={index >= 0 ? classes[index].title : "Class"}
        onClose={() => setSlug(null)}
        onClick={(e) => {
          const t = e.target as HTMLElement;
          // Backdrop click, or a jump to a building block on the page underneath.
          if (t === e.currentTarget || t.closest('a[href^="#"]')) ref.current?.close();
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
  return (
    <article className="cls">
      <form method="dialog" className="cls-modal-bar">
        <button type="submit" className="cls-modal-close" aria-label="Close">
          ✕
        </button>
      </form>
      <header className="cls-head">
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
      </header>

      <ol className="seq">
        {c.parts.map((p, j) => (
          <li key={j} data-type={partType(p)}>
            <PartView part={p} />
          </li>
        ))}
      </ol>

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
