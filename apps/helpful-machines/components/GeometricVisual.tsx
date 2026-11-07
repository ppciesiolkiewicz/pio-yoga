"use client";

import { useEffect, useRef } from "react";

type Vec = [number, number, number];
type Shape = { verts: Vec[]; faces: number[][] };

const PHI = (1 + Math.sqrt(5)) / 2;

/** Unit-radius icosahedron. */
function icosahedron(): Shape {
  const raw: Vec[] = [
    [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
    [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
    [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
  ];
  const len = Math.hypot(1, PHI);
  return {
    verts: raw.map(([x, y, z]) => [x / len, y / len, z / len]),
    faces: [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ],
  };
}

/** Unit-radius octahedron. */
function octahedron(): Shape {
  return {
    verts: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]],
    faces: [
      [4, 0, 2], [4, 2, 1], [4, 1, 3], [4, 3, 0],
      [5, 2, 0], [5, 1, 2], [5, 3, 1], [5, 0, 3],
    ],
  };
}

function rotate([x, y, z]: Vec, ax: number, ay: number, az: number): Vec {
  // X
  let c = Math.cos(ax), s = Math.sin(ax);
  [y, z] = [y * c - z * s, y * s + z * c];
  // Y
  c = Math.cos(ay); s = Math.sin(ay);
  [x, z] = [x * c + z * s, -x * s + z * c];
  // Z
  c = Math.cos(az); s = Math.sin(az);
  [x, y] = [x * c - y * s, x * s + y * c];
  return [x, y, z];
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace("#", "");
  const full = h.length === 3 ? h.split("").map((ch) => ch + ch).join("") : h;
  const n = parseInt(full, 16);
  return Number.isNaN(n) ? [255, 90, 54] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: number[], b: number[], t: number) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

type Body = {
  shape: Shape;
  radius: number;
  pos: (t: number) => Vec;
  rot: (t: number) => Vec;
  wire?: boolean;
};

const LIGHT: Vec = (() => {
  const l: Vec = [-0.5, -0.7, 0.9];
  const n = Math.hypot(...l);
  return [l[0] / n, l[1] / n, l[2] / n];
})();

/**
 * Decorative 3D geometry for the hero's right column: a faceted icosahedron
 * floating and tumbling in space, with a small octahedron and a wireframe
 * shell orbiting it. Rendered to a canvas; purely visual.
 */
export function GeometricVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ico = icosahedron();
    const oct = octahedron();

    const bodies: Body[] = [
      {
        shape: ico,
        radius: 1,
        pos: (t) => [0, Math.sin(t * 0.9) * 0.12, 0],
        rot: (t) => [t * 0.35, t * 0.5, Math.sin(t * 0.3) * 0.3],
      },
      {
        shape: ico,
        radius: 1.55,
        wire: true,
        pos: (t) => [0, Math.sin(t * 0.9) * 0.12, 0],
        rot: (t) => [-t * 0.15, -t * 0.22, t * 0.1],
      },
      {
        shape: oct,
        radius: 0.28,
        pos: (t) => [Math.cos(t * 0.8) * 1.9, Math.sin(t * 0.8) * 0.5 - 0.2, Math.sin(t * 0.8) * 1.9],
        rot: (t) => [t * 1.2, t * 0.9, 0],
      },
      {
        shape: oct,
        radius: 0.16,
        pos: (t) => [Math.cos(-t * 0.6 + 2) * 1.6, Math.cos(t * 0.6) * 0.9 + 0.3, Math.sin(-t * 0.6 + 2) * 1.6],
        rot: (t) => [t * 1.5, -t * 1.1, t * 0.4],
      },
    ];

    let colors = { dark: [184, 53, 13], mid: [255, 90, 54], light: [255, 201, 74], line: [30, 26, 21] };
    const readColors = () => {
      const css = getComputedStyle(canvas);
      colors = {
        dark: hexToRgb(css.getPropertyValue("--accent-text") || "#b8350d"),
        mid: hexToRgb(css.getPropertyValue("--accent") || "#ff5a36"),
        light: hexToRgb(css.getPropertyValue("--highlight") || "#ffc94a"),
        line: hexToRgb(css.getPropertyValue("--line") || "#1e1a15"),
      };
    };
    readColors();
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", readColors);
    const themeObserver = new MutationObserver(readColors);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });

    let size = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = rect.width;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const CAMERA = 6;
    // Fit the whole scene (orbiters included) inside the canvas: sample the motion
    // over a long window, find the widest projected vertex, and scale so it lands
    // at FIT of the half-width — the rest is room for strokes.
    const FIT = 0.9;
    let extent = 0;
    for (let t = 0; t < 120; t += 0.05) {
      for (const body of bodies) {
        const [ax, ay, az] = body.rot(t);
        const [px, py, pz] = body.pos(t);
        for (const v of body.shape.verts) {
          const [x, y, z] = rotate(v, ax, ay, az);
          const persp = CAMERA / (CAMERA - (z * body.radius + pz));
          extent = Math.max(extent, Math.abs(x * body.radius + px) * persp, Math.abs(y * body.radius + py) * persp);
        }
      }
    }
    const k = (0.5 * FIT) / extent;
    const project = ([x, y, z]: Vec): [number, number] => {
      const scale = (size * k * CAMERA) / (CAMERA - z);
      return [size / 2 + x * scale, size / 2 + y * scale];
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, size, size);
      type Poly = { pts: [number, number][]; depth: number; shade: number; wire: boolean };
      const polys: Poly[] = [];

      for (const body of bodies) {
        const [ax, ay, az] = body.rot(t);
        const [px, py, pz] = body.pos(t);
        const world = body.shape.verts.map((v) => {
          const [x, y, z] = rotate(v, ax, ay, az);
          return [x * body.radius + px, y * body.radius + py, z * body.radius + pz] as Vec;
        });

        for (const face of body.shape.faces) {
          const [a, b, c] = face.map((i) => world[i]);
          const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
          const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
          let n: Vec = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
          const nl = Math.hypot(...n) || 1;
          n = [n[0] / nl, n[1] / nl, n[2] / nl];
          const center: Vec = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
          const toCam = [-center[0], -center[1], CAMERA - center[2]];
          const facing = n[0] * toCam[0] + n[1] * toCam[1] + n[2] * toCam[2];
          // Solids cull back faces; the wire shell draws its back faces fainter.
          if (!body.wire && facing <= 0) continue;
          const shade = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
          polys.push({
            pts: [a, b, c].map(project),
            depth: center[2],
            shade: body.wire ? (facing > 0 ? 1 : 0.4) : shade,
            wire: !!body.wire,
          });
        }
      }

      polys.sort((p, q) => p.depth - q.depth);

      for (const p of polys) {
        ctx.beginPath();
        ctx.moveTo(p.pts[0][0], p.pts[0][1]);
        ctx.lineTo(p.pts[1][0], p.pts[1][1]);
        ctx.lineTo(p.pts[2][0], p.pts[2][1]);
        ctx.closePath();
        const [lr, lg, lb] = colors.line;
        if (p.wire) {
          ctx.strokeStyle = `rgba(${lr},${lg},${lb},${0.18 * p.shade})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          continue;
        }
        const rgb = p.shade < 0.5 ? mix(colors.dark, colors.mid, p.shade * 2) : mix(colors.mid, colors.light, (p.shade - 0.5) * 2);
        ctx.fillStyle = `rgb(${rgb.join(",")})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${lr},${lg},${lb},0.55)`;
        ctx.lineWidth = 1.25;
        ctx.lineJoin = "round";
        ctx.stroke();
      }
    };

    let frame = 0;
    const start = performance.now();
    const loop = (now: number) => {
      draw((now - start) / 1000);
      frame = requestAnimationFrame(loop);
    };
    if (reduceMotion) draw(2);
    else frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      scheme.removeEventListener("change", readColors);
    };
  }, []);

  return (
    // Oversized and pulled out with negative margins so it bleeds behind the hero text
    // and past the column edges; the hero renders the text column above it.
    <div
      aria-hidden="true"
      className="pointer-events-none relative -my-16 -ml-20 -mr-8 aspect-square w-[calc(100%+7rem)] max-w-none"
    >
      <div className="absolute inset-[22%] rounded-full bg-accent/25 blur-3xl" />
      <canvas ref={canvasRef} className="relative h-full w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.25)]" />
    </div>
  );
}
