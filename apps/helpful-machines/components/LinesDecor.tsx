"use client";

import { useEffect, useId, useRef } from "react";

/**
 * Thin lines running in from the edges of a section (see VARIANTS), passing under its content
 * (which sits above the decor layer). Scrolling the section into view plays a one-off animation that extends them onto the screen and
 * (pricing) bends them from straight into curves. Drawn immediately under prefers-reduced-motion. Rendered inside Section's
 * aria-hidden decor slot.
 */
const W = 1000;
const H = 600;

type Line = {
  from: [number, number]; // off-screen start
  to: [number, number]; // end, hidden under a card
  bend: number; // control-point offset (px in viewBox) when fully curved
  stroke: string; // gradient start
  stroke2: string; // gradient end
};

type Variant = {
  opacity: number;
  lines: Line[];
  /** Fuzz: blur radius in px on the crisp line (the glow underneath is always blurred). */
  blur?: number;
  /** Fixed curvature 0..1: lines don't morph on scroll, only their tips extend. Omit to morph straight -> curved. */
  fixedCurve?: number;
};

const VARIANTS: Record<"pricing" | "founder", Variant> = {
  // run in from the edges and disappear under the plan cards
  pricing: {
    opacity: 0.7,
    lines: [
      { from: [-30, 70], to: [240, 250], bend: 80, stroke: "#b98cff", stroke2: "#5fd0c2" },
      { from: [1030, 40], to: [790, 215], bend: -80, stroke: "#5fd0c2", stroke2: "#ffc94a" },
      { from: [-30, 600], to: [260, 440], bend: -70, stroke: "#ff5a36", stroke2: "#ff7ab6" },
    ],
  },
  // parallel multicolour stripes sweeping across the top of the section, as a divider from the section above
  founder: {
    opacity: 0.75,
    blur: 1.5,
    fixedCurve: 0.8,
    lines: ["#b98cff", "#6aa8ff", "#5fd0c2", "#ffc94a", "#ff5a36", "#ff7ab6"].slice(0, 5).map(
      (stroke, i, all): Line => ({ from: [-30, 100 + i * 9], to: [1030, 140 + i * 9], bend: 45, stroke, stroke2: all[(i + 1) % all.length] }),
    ),
  },
};

function pathFor(line: Line, extend: number, curve: number) {
  const [sx, sy] = line.from;
  const ex = sx + (line.to[0] - sx) * extend;
  const ey = sy + (line.to[1] - sy) * extend;
  const dx = ex - sx;
  const dy = ey - sy;
  const len = Math.hypot(dx, dy) || 1;
  // perpendicular offset from the midpoint; 0 keeps the line straight
  const off = line.bend * curve;
  const cx = sx + dx / 2 + (-dy / len) * off;
  const cy = sy + dy / 2 + (dx / len) * off;
  return `M${sx.toFixed(1)} ${sy.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
}

const DURATION_MS = 1800;
const STAGGER_MS = 140;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => n * n * (3 - 2 * n);

export function LinesDecor({ variant }: { variant: keyof typeof VARIANTS }) {
  const { lines, opacity, blur, fixedCurve } = VARIANTS[variant];
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const paint = (progress: (i: number) => number) => {
      lines.forEach((line, i) => {
        const p = progress(i);
        const d = pathFor(line, ease(p), fixedCurve ?? ease(clamp01((p - 0.2) / 0.8)));
        pathRefs.current[i]?.setAttribute("d", d);
        pathRefs.current[i + lines.length]?.setAttribute("d", d);
      });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paint(() => 1);
      return;
    }

    // Scrolling the section into view triggers a one-off timed animation (staggered per line); it plays out
    // on its own and is not tied to the scroll position, so scrolling back leaves the lines as they are.
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const elapsed = now - start;
          paint((i) => clamp01((elapsed - i * STAGGER_MS) / DURATION_MS));
          if (elapsed < DURATION_MS + (lines.length - 1) * STAGGER_MS) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.2 },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [lines, fixedCurve]);

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="size-full" fill="none">
        <defs>
          {lines.map((line, i) => (
            <linearGradient key={i} id={`${uid}-g${i}`} gradientUnits="userSpaceOnUse" x1={-30} y1={0} x2={1030} y2={0}>
              <stop offset="0" stopColor={line.stroke} />
              <stop offset="1" stopColor={line.stroke2} />
            </linearGradient>
          ))}
        </defs>
        {/* Like the glass shapes' inlay: a soft glow under a thin gradient outline. Two passes share one path index space. */}
        {[0, 1].map((pass) => (
          <g key={pass} style={{ filter: pass === 0 ? "blur(6px)" : blur ? `blur(${blur}px)` : undefined }} opacity={pass === 0 ? opacity * 0.6 : opacity}>
            {lines.map((line, i) => (
              <path
                key={i}
                ref={(el) => {
                  pathRefs.current[i + pass * lines.length] = el;
                }}
                d={pathFor(line, 0, 0)}
                stroke={`url(#${uid}-g${i})`}
                strokeWidth={pass === 0 ? 7 : 1.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
