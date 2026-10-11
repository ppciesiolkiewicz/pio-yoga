"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useEffect, useState, type ReactNode } from "react";
import { COLOR_MODE_KEY, resolveColorMode, type ColorModePreference } from "@repo/web/color-mode";

export type ColorModeLabels = { group: string; light: string; dark: string; system: string };

const MODES = ["light", "dark", "system"] as const;
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const icons: Record<ColorModePreference, ReactNode> = {
  light: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...stroke}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...stroke}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  ),
  system: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...stroke}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  ),
};

function readStored(): ColorModePreference {
  try {
    const value = localStorage.getItem(COLOR_MODE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function ColorModeSwitch({ labels }: { labels: ColorModeLabels }) {
  // null until mounted, so server and first client render match (no hydration mismatch).
  const [pref, setPref] = useState<ColorModePreference | null>(null);

  useEffect(() => setPref(readStored()), []);

  useEffect(() => {
    if (pref === null) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const mode = resolveColorMode(pref, media.matches);
      document.documentElement.dataset.theme = mode;
      document.documentElement.style.colorScheme = mode;
    };
    apply();
    if (pref !== "system") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [pref]);

  const choose = (value: string) => {
    if (value !== "light" && value !== "dark" && value !== "system") return; // "" = deselect; ignore
    setPref(value);
    try {
      if (value === "system") localStorage.removeItem(COLOR_MODE_KEY);
      else localStorage.setItem(COLOR_MODE_KEY, value);
    } catch {
      // storage blocked: the choice still applies for this page view
    }
  };

  return (
    <ToggleGroup.Root
      type="single"
      value={pref ?? "system"}
      onValueChange={choose}
      aria-label={labels.group}
      className="inline-flex rounded-full border-2 border-line bg-surface p-0.5"
    >
      {MODES.map((mode) => (
        <ToggleGroup.Item
          key={mode}
          value={mode}
          aria-label={labels[mode]}
          className="grid size-11 place-items-center rounded-full text-ink data-[state=on]:bg-ink data-[state=on]:text-bg"
        >
          {icons[mode]}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
