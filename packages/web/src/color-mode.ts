export const COLOR_MODE_KEY = "colorMode";
export type ColorModePreference = "light" | "dark" | "system";
export type ColorMode = "light" | "dark";

export function resolveColorMode(pref: string | null, systemDark: boolean): ColorMode {
  if (pref === "light" || pref === "dark") return pref;
  return systemDark ? "dark" : "light";
}

/**
 * Inline <head> script: applies the stored or system colour mode before first paint.
 * Keep in sync with resolveColorMode. Allowed by CSP through cspHash(colorModeScript).
 */
export const colorModeScript = `(function(){var m="light";try{m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){}try{var p=localStorage.getItem("${COLOR_MODE_KEY}");if(p==="light"||p==="dark")m=p}catch(e){}var d=document.documentElement;d.dataset.theme=m;d.style.colorScheme=m})()`;
