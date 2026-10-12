import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock is hoisted above imports, so the mock object must be created with vi.hoisted.
const posthog = vi.hoisted(() => ({ init: vi.fn(), register: vi.fn(), capture: vi.fn(), set_config: vi.fn() }));
vi.mock("posthog-js", () => ({ default: posthog }));

const { ConsentBanner, ConsentSettingsButton, CONSENT_EVENT, readConsent } = await import("../src/components/ConsentBanner");
const { Analytics } = await import("../src/components/Analytics");
const { track } = await import("../src/events");

const labels = { label: "Zgoda na pliki cookie", text: "Używamy analityki.", accept: "Akceptuję", decline: "Odrzucam", policy: "Polityka prywatności" };

beforeEach(() => {
  vi.clearAllMocks();
  (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback = (cb) => {
    cb();
    return 1;
  };
});

describe("ConsentBanner", () => {
  it("asks once, with equally prominent buttons, and stores the answer", async () => {
    const seen = vi.fn();
    window.addEventListener(CONSENT_EVENT, (e) => seen((e as CustomEvent).detail));
    render(<ConsentBanner labels={labels} policyHref="/pl/privacy" />);
    const region = await screen.findByRole("region", { name: "Zgoda na pliki cookie" });
    const accept = screen.getByRole("button", { name: "Akceptuję" });
    const decline = screen.getByRole("button", { name: "Odrzucam" });
    expect(accept.className).toBe(decline.className);
    expect(screen.getByRole("link", { name: "Polityka prywatności" }).getAttribute("href")).toBe("/pl/privacy");
    await userEvent.click(decline);
    expect(readConsent()).toBe("denied");
    expect(seen).toHaveBeenCalledWith("denied");
    expect(region.isConnected).toBe(false);
  });

  it("stays hidden once a decision exists", () => {
    document.cookie = "consent=granted; Path=/";
    render(<ConsentBanner labels={labels} policyHref="/pl/privacy" />);
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("can be reopened from the footer settings button", async () => {
    document.cookie = "consent=denied; Path=/";
    render(
      <>
        <ConsentBanner labels={labels} policyHref="/pl/privacy" />
        <ConsentSettingsButton label="Ustawienia prywatności" />
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Ustawienia prywatności" }));
    expect(screen.getByRole("region", { name: "Zgoda na pliki cookie" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Akceptuję" }));
    expect(readConsent()).toBe("granted");
  });
});

describe("Analytics", () => {
  it("does nothing without a key", async () => {
    render(<Analytics apiKey="" locale="en" assignment={{ hero: "control" }} />);
    await new Promise((r) => setTimeout(r, 0));
    expect(posthog.init).not.toHaveBeenCalled();
  });

  it("starts in memory mode on /pl without consent and reports exposure", async () => {
    render(<Analytics apiKey="phc_test" locale="pl" assignment={{ hero: "easy-mode" }} />);
    await waitFor(() => expect(posthog.init).toHaveBeenCalled());
    expect(posthog.init).toHaveBeenCalledWith("phc_test", expect.objectContaining({ api_host: "/ingest", persistence: "memory" }));
    expect(posthog.register).toHaveBeenCalledWith(expect.objectContaining({ market: "pl", "$feature/hero": "easy-mode" }));
    expect(posthog.capture).toHaveBeenCalledWith("$feature_flag_called", { $feature_flag: "hero", $feature_flag_response: "easy-mode" });
  });

  it("switches persistence when consent is granted", async () => {
    render(<Analytics apiKey="phc_test" locale="pl" assignment={{}} />);
    await waitFor(() => expect(posthog.init).toHaveBeenCalled());
    act(() => {
      window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: "granted" }));
    });
    expect(posthog.set_config).toHaveBeenCalledWith({ persistence: "localStorage+cookie" });
  });

  it("uses cookies from the start in Australia", async () => {
    render(<Analytics apiKey="phc_test" locale="en" assignment={{}} />);
    await waitFor(() => expect(posthog.init).toHaveBeenCalled());
    expect(posthog.init).toHaveBeenCalledWith("phc_test", expect.objectContaining({ persistence: "localStorage+cookie" }));
  });

  it("captures tracked clicks and component events with the market", async () => {
    render(
      <>
        <Analytics apiKey="phc_test" locale="en" assignment={{}} />
        <a href="#x" data-track="booking_opened" data-track-location="hero">Book a free chat</a>
      </>,
    );
    await waitFor(() => expect(posthog.init).toHaveBeenCalled());
    await userEvent.click(screen.getByRole("link", { name: "Book a free chat" }));
    expect(posthog.capture).toHaveBeenCalledWith("booking_opened", { location: "hero", label: "Book a free chat", market: "en" });
    act(() => track("form_submitted", { success: true }));
    expect(posthog.capture).toHaveBeenCalledWith("form_submitted", { success: true, market: "en" });
  });
});

describe("ConsentBanner focus", () => {
  it("moves focus to the main content after a first-visit choice", async () => {
    render(
      <>
        <main id="main" tabIndex={-1}>
          content
        </main>
        <ConsentBanner labels={labels} policyHref="/pl/privacy" />
      </>,
    );
    await userEvent.click(await screen.findByRole("button", { name: "Odrzucam" }));
    expect(document.activeElement?.id).toBe("main");
  });

  it("returns focus to the settings button after reopening", async () => {
    document.cookie = "consent=denied; Path=/";
    render(
      <>
        <main id="main" tabIndex={-1}>
          content
        </main>
        <ConsentBanner labels={labels} policyHref="/pl/privacy" />
        <ConsentSettingsButton label="Ustawienia prywatności" />
      </>,
    );
    const settings = screen.getByRole("button", { name: "Ustawienia prywatności" });
    await userEvent.click(settings);
    await userEvent.click(screen.getByRole("button", { name: "Akceptuję" }));
    expect(document.activeElement).toBe(settings);
  });
});
