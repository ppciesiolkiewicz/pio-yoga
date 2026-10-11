import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, type Mock } from "vitest";
import { ColorModeSwitch } from "../src/components/ColorModeSwitch";
import { setSystemDark } from "./setup";

const labels = { group: "Colour mode", light: "Light", dark: "Dark", system: "System" };
const root = () => document.documentElement;
const state = (name: string) => screen.getByLabelText(name).getAttribute("data-state");

describe("ColorModeSwitch", () => {
  it("is a labelled group with 44px targets", () => {
    render(<ColorModeSwitch labels={labels} />);
    expect(screen.getByRole("radiogroup", { name: "Colour mode" })).toBeTruthy();
    expect(screen.getByLabelText("Light").className).toContain("size-11");
  });

  it("shows and applies a stored choice", () => {
    localStorage.setItem("colorMode", "dark");
    render(<ColorModeSwitch labels={labels} />);
    expect(state("Dark")).toBe("on");
    expect(root().dataset.theme).toBe("dark");
    expect(root().style.colorScheme).toBe("dark");
  });

  it("defaults to System and follows the OS", () => {
    setSystemDark(true);
    render(<ColorModeSwitch labels={labels} />);
    expect(state("System")).toBe("on");
    expect(root().dataset.theme).toBe("dark");
  });

  it("stores an explicit choice", async () => {
    render(<ColorModeSwitch labels={labels} />);
    await userEvent.click(screen.getByLabelText("Light"));
    expect(localStorage.getItem("colorMode")).toBe("light");
    expect(root().dataset.theme).toBe("light");
    expect(state("Light")).toBe("on");
  });

  it("System clears the stored choice", async () => {
    localStorage.setItem("colorMode", "light");
    setSystemDark(true);
    render(<ColorModeSwitch labels={labels} />);
    await userEvent.click(screen.getByLabelText("System"));
    expect(localStorage.getItem("colorMode")).toBeNull();
    expect(root().dataset.theme).toBe("dark");
  });

  it("follows live OS changes while on System", () => {
    render(<ColorModeSwitch labels={labels} />);
    expect(root().dataset.theme).toBe("light");
    const lists = (window.matchMedia as unknown as Mock).mock.results.map((r) => r.value);
    const call = lists.flatMap((l) => (l.addEventListener as Mock).mock.calls).find((c) => c[0] === "change");
    expect(call).toBeTruthy();
    setSystemDark(true);
    act(() => (call![1] as () => void)());
    expect(root().dataset.theme).toBe("dark");
  });

  it("survives blocked storage", () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error("blocked");
    };
    try {
      render(<ColorModeSwitch labels={labels} />);
      expect(state("System")).toBe("on");
    } finally {
      Storage.prototype.getItem = original;
    }
  });
});

describe("ColorModeSwitch shared state", () => {
  const fireOsChange = () => {
    const lists = (window.matchMedia as unknown as Mock).mock.results.map((r) => r.value);
    for (const list of lists) {
      const removed = new Set((list.removeEventListener as Mock).mock.calls.map((c) => c[1]));
      for (const [event, handler] of (list.addEventListener as Mock).mock.calls) {
        // Only listeners still attached, like a real MediaQueryList.
        if (event === "change" && !removed.has(handler)) act(() => (handler as () => void)());
      }
    }
  };

  it("keeps every switch in sync, and an explicit choice beats later OS changes", async () => {
    render(
      <>
        <ColorModeSwitch labels={labels} />
        <ColorModeSwitch labels={{ ...labels, group: "Menu colour mode" }} />
      </>,
    );
    const [, menuDark] = screen.getAllByLabelText("Dark");
    await userEvent.click(menuDark!);
    for (const item of screen.getAllByLabelText("Dark")) expect(item.getAttribute("data-state")).toBe("on");
    setSystemDark(false);
    fireOsChange();
    expect(root().dataset.theme).toBe("dark");
  });

  it("follows a choice made in another tab", () => {
    render(<ColorModeSwitch labels={labels} />);
    act(() => {
      localStorage.setItem("colorMode", "dark");
      window.dispatchEvent(new StorageEvent("storage", { key: "colorMode", newValue: "dark" }));
    });
    expect(state("Dark")).toBe("on");
    expect(root().dataset.theme).toBe("dark");
  });
});
