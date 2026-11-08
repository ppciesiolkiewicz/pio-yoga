"use client";

import { useEffect, useRef } from "react";

/**
 * Glass "puzzle" shapes (each with a glowing metallic inlay) peeking in from the edges of the services section.
 * Parallax: every layer has a depth (`--d`). The pointer position (--px/--py, -1..1) and the section's position
 * in the viewport (--sy, roughly -1..1) are written to CSS variables here, and `.hm-parallax` turns them into a
 * per-layer translate (nearer = moves more). Rendered inside Section's aria-hidden decor slot; static under
 * prefers-reduced-motion.
 */
export function ServicesDecor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let px = 0;
    let py = 0;
    const apply = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the section's centre is at the viewport centre, ±1 about a viewport away
      const sy = Math.max(-1.5, Math.min(1.5, (rect.top + rect.height / 2 - vh / 2) / vh));
      root.style.setProperty("--px", px.toFixed(3));
      root.style.setProperty("--py", py.toFixed(3));
      root.style.setProperty("--sy", sy.toFixed(3));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onPointer = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth) * 2 - 1;
      py = (e.clientY / window.innerHeight) * 2 - 1;
      schedule();
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 hidden sm:block">
      {/* left cluster, partly off-screen */}
      <div className="hm-glass hm-parallax absolute -left-20 top-[38%] size-44 rotate-6 rounded-card [--d:22]">
        <div className="hm-glass-inlay hm-parallax [--d:6] [--inlay:#ff5a36] [--inlay-2:#b98cff]" />
      </div>
      <div className="hm-glass hm-parallax absolute left-16 top-[62%] size-16 rounded-full [--d:42]">
        <div className="hm-glass-inlay hm-parallax [--d:3] [--inlay:#5fd0c2] [--inlay-2:#ffc94a]" />
      </div>

      {/* right cluster: shapes interlock like puzzle pieces, half off-screen */}
      <div className="hm-glass hm-parallax absolute -right-32 top-[8%] size-64 rounded-full [--d:20]">
        <div className="hm-glass-inlay hm-parallax [--d:8] [--inlay:#b98cff] [--inlay-2:#5fd0c2]" />
      </div>
      <div className="hm-glass hm-parallax absolute -right-24 top-[46%] size-48 rotate-12 rounded-card [--d:30]">
        <div className="hm-glass-inlay hm-parallax [--d:6] [--inlay:#ffc94a] [--inlay-2:#ff5a36]" />
      </div>
      <div className="hm-glass hm-parallax absolute right-28 top-[40%] size-14 rounded-full [--d:48]">
        <div className="hm-glass-inlay hm-parallax [--d:3] [--inlay:#ff7ab6] [--inlay-2:#ffc94a]" />
      </div>
      <div className="hm-glass hm-parallax absolute -right-10 top-[2%] size-20 -rotate-12 rounded-2xl [--d:38]">
        <div className="hm-glass-inlay hm-parallax [--d:4] [--inlay:#6aa8ff] [--inlay-2:#b98cff]" />
      </div>

      {/* bottom-left cluster, dipping below the section's bottom edge */}
      <div className="hm-glass hm-parallax absolute -bottom-24 left-[6%] size-56 -rotate-6 rounded-full [--d:24]">
        <div className="hm-glass-inlay hm-parallax [--d:7] [--inlay:#5fd0c2] [--inlay-2:#6aa8ff]" />
      </div>
      <div className="hm-glass hm-parallax absolute -bottom-10 left-[22%] size-28 rotate-12 rounded-card [--d:36]">
        <div className="hm-glass-inlay hm-parallax [--d:4] [--inlay:#ff5a36] [--inlay-2:#ffc94a]" />
      </div>
      <div className="hm-glass hm-parallax absolute -left-8 bottom-[14%] size-12 rounded-full [--d:46]">
        <div className="hm-glass-inlay hm-parallax [--d:3] [--inlay:#b98cff] [--inlay-2:#ff7ab6]" />
      </div>

      {/* bottom-right cluster */}
      <div className="hm-glass hm-parallax absolute -bottom-20 -right-16 size-52 rotate-6 rounded-card [--d:26]">
        <div className="hm-glass-inlay hm-parallax [--d:6] [--inlay:#ff7ab6] [--inlay-2:#b98cff]" />
      </div>
      <div className="hm-glass hm-parallax absolute -bottom-8 right-[18%] size-20 rounded-full [--d:40]">
        <div className="hm-glass-inlay hm-parallax [--d:3] [--inlay:#ffc94a] [--inlay-2:#5fd0c2]" />
      </div>
    </div>
  );
}
