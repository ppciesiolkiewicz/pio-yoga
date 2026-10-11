import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { colorModeScript, resolveColorMode } from "../src/color-mode";
import { cspHash } from "../src/csp";

function runScript(o: { stored?: string | null; throws?: boolean; systemDark?: boolean }) {
  const root = { dataset: {} as Record<string, string>, style: {} as Record<string, string> };
  vm.runInNewContext(colorModeScript, {
    document: { documentElement: root },
    localStorage: {
      getItem: () => {
        if (o.throws) throw new Error("blocked");
        return o.stored ?? null;
      },
    },
    matchMedia: () => ({ matches: !!o.systemDark }),
  });
  return root;
}

describe("resolveColorMode", () => {
  it("honours an explicit choice", () => {
    expect(resolveColorMode("dark", false)).toBe("dark");
    expect(resolveColorMode("light", true)).toBe("light");
  });
  it("falls back to the system for system, null or garbage", () => {
    expect(resolveColorMode("system", true)).toBe("dark");
    expect(resolveColorMode(null, false)).toBe("light");
    expect(resolveColorMode("blue", true)).toBe("dark");
  });
});

describe("colorModeScript", () => {
  it("applies a stored choice", () => {
    const root = runScript({ stored: "dark" });
    expect(root.dataset.theme).toBe("dark");
    expect(root.style.colorScheme).toBe("dark");
  });
  it("prefers the stored choice over the system", () => expect(runScript({ stored: "light", systemDark: true }).dataset.theme).toBe("light"));
  it("follows the system with no choice", () => expect(runScript({ systemDark: true }).dataset.theme).toBe("dark"));
  it("survives blocked storage", () => expect(runScript({ throws: true, systemDark: true }).dataset.theme).toBe("dark"));
  it("is tiny", () => expect(colorModeScript.length).toBeLessThan(400));
});

describe("cspHash", () => {
  it("returns a quoted sha256 source", () => expect(cspHash("a")).toBe("'sha256-ypeBEsobvcr6wjGzmiPcTaeG7/gUfE5yuYB3ha/uSLs='"));
});
