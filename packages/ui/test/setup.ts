import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

let systemDark = false;
/** Tests flip the OS colour scheme with setSystemDark(true). */
export function setSystemDark(value: boolean) {
  systemDark = value;
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn((query: string) => ({
    get matches() {
      return query.includes("dark") ? systemDark : false;
    },
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

afterEach(() => {
  cleanup();
  vi.mocked(window.matchMedia).mockClear();
  localStorage.clear();
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0]?.trim();
    if (name) document.cookie = `${name}=; Max-Age=0; Path=/`;
  });
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.colorScheme = "";
  systemDark = false;
});
