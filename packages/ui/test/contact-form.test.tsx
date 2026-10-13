import { render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm, type ContactFormLabels } from "../src/components/ContactForm";
import { ANALYTICS_EVENT } from "../src/events";

const labels: ContactFormLabels = {
  name: "Your name",
  email: "Email",
  company: "Business name (optional)",
  message: "What would you like help with?",
  submit: "Send message",
  sending: "Sending…",
  sent: "Thanks! Your message is on its way.",
  errorSummary: "Please fix the highlighted fields.",
  emailFallback: "You can also email us at",
  fieldErrors: { name: "Please enter your name.", email: "Please enter a valid email address.", company: "Too long.", message: "Please write a little more." },
  errors: {
    validation: "Please check the form and try again.",
    rate_limited: "Too many messages.",
    send_failed: "Sorry, something went wrong sending your message.",
    unavailable: "The contact form isn't available right now.",
    bad_request: "Sorry, something went wrong sending your message.",
  },
};
const respond = (status: number, body: unknown) => vi.fn(async () => new Response(JSON.stringify(body), { status }));
async function fill() {
  await userEvent.type(screen.getByLabelText("Your name"), "Ania");
  await userEvent.type(screen.getByLabelText("Email"), "ania@example.pl");
  await userEvent.type(screen.getByLabelText("What would you like help with?"), "Arkusze i automatyzacja.");
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

describe("ContactForm markup (no-JS path)", () => {
  it("posts to the API with the contract's field names", async () => {
    const { container } = render(<ContactForm locale="pl" labels={labels} email="hello@attunr.com" />);
    const form = container.querySelector("form")!;
    expect(form.getAttribute("method")).toBe("post");
    expect(form.getAttribute("action")).toBe("/api/contact");
    for (const name of ["name", "email", "company", "message", "locale", "website", "t"]) {
      expect(form.querySelector(`[name="${name}"]`), name).not.toBeNull();
    }
    expect((form.querySelector('[name="locale"]') as HTMLInputElement).value).toBe("pl");
    await waitFor(() => expect((form.querySelector('[name="t"]') as HTMLInputElement).value).toMatch(/^\d+$/));
  });
  it("hides the honeypot from people and assistive tech", () => {
    const { container } = render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    const trap = container.querySelector('[name="website"]') as HTMLInputElement;
    expect(trap.tabIndex).toBe(-1);
    expect(trap.closest('[aria-hidden="true"]')).not.toBeNull();
  });
  it("uses native validation hints", () => {
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    expect(screen.getByLabelText("Your name").hasAttribute("required")).toBe(true);
    expect(screen.getByLabelText("Email").getAttribute("type")).toBe("email");
    expect(screen.getByLabelText("What would you like help with?").getAttribute("minlength")).toBe("10");
  });
});

describe("ContactForm with JavaScript", () => {
  it("sends JSON and confirms success", async () => {
    const fetchMock = respond(200, { ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const events = vi.fn();
    window.addEventListener(ANALYTICS_EVENT, (e) => events((e as CustomEvent).detail));
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect((await screen.findByText(labels.sent)).getAttribute("role")).toBe("status");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(init.body as string)).toMatchObject({ name: "Ania", email: "ania@example.pl", locale: "en", website: "" });
    expect(events).toHaveBeenCalledWith({ event: "form_submitted", properties: { success: true } });
    expect((screen.getByLabelText("Your name") as HTMLInputElement).value).toBe("");
  });

  it("shows field errors linked to inputs and focuses the summary", async () => {
    vi.stubGlobal("fetch", respond(400, { ok: false, error: "validation", fields: { email: "Invalid email" } }));
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain(labels.errorSummary);
    expect(screen.getByRole("link", { name: labels.fieldErrors.email }).getAttribute("href")).toBe("#contact-email");
    const email = screen.getByLabelText("Email");
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(email.getAttribute("aria-describedby")!)?.textContent).toBe(labels.fieldErrors.email);
    expect(document.activeElement).toBe(alert);
  });

  it("offers the email address when the form is unavailable", async () => {
    vi.stubGlobal("fetch", respond(503, { ok: false, error: "unavailable" }));
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain(labels.errors.unavailable);
    expect(screen.getByRole("link", { name: "hello@attunr.com" }).getAttribute("href")).toBe("mailto:hello@attunr.com");
  });

  it("handles network failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("offline"))));
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect((await screen.findByRole("alert")).textContent).toContain(labels.errors.send_failed);
  });

  it("shows the result of a no-JS submission from the URL", async () => {
    window.history.replaceState({}, "", "/contact?sent=1");
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    expect((await screen.findByText(labels.sent)).getAttribute("role")).toBe("status");
  });

  it("shows a no-JS error from the URL", async () => {
    window.history.replaceState({}, "", "/contact?error=rate_limited");
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    expect((await screen.findByRole("alert")).textContent).toContain(labels.errors.rate_limited);
  });
});

describe("ContactForm without JavaScript (static HTML)", () => {
  it("ships every result message, revealed by the redirect's #anchor", () => {
    const html = renderToString(<ContactForm locale="pl" labels={labels} email="hello@attunr.com" />);
    expect(html).toMatch(/id="contact-sent"[^>]*class="[^"]*target:block/);
    expect(html).toContain(labels.sent);
    for (const key of Object.keys(labels.errors)) expect(html).toContain(`id="contact-error-${key}"`);
    expect(html).toContain("mailto:hello@attunr.com");
  });
  it("removes the static messages once JavaScript takes over", async () => {
    const { container } = render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    await waitFor(() => expect(container.querySelector("#contact-sent")).toBeNull());
  });
});

describe("ContactForm borders", () => {
  it("draws inputs with the control border token (≥3:1 in every design)", () => {
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    expect(screen.getByLabelText("Your name").className).toContain("border-control");
  });
});

describe("ContactForm accessibility and URL hygiene", () => {
  it("keeps one polite live region mounted, empty until success", () => {
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    const live = screen.getByRole("status");
    expect(live.getAttribute("aria-live")).toBe("polite");
    expect(live.textContent).toBe("");
  });
  it("styles invalid fields visibly, not only with text", () => {
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    expect(screen.getByLabelText("Email").className).toContain("aria-invalid:border-accent-text");
  });
  it("cleans ?sent=1 and the #anchor from the URL after showing the result", async () => {
    window.history.replaceState({}, "", "/contact?sent=1#contact-sent");
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    await screen.findByText(labels.sent);
    expect(window.location.search).toBe("");
    expect(window.location.hash).toBe("");
  });
});

describe("ContactForm keeps the router's history state", () => {
  it("cleans the URL without wiping Next's history state (Back must keep working)", async () => {
    window.history.replaceState({ __NA: true, tree: "x" }, "", "/contact?sent=1#contact-sent");
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    await screen.findByText(labels.sent);
    expect(window.location.search).toBe("");
    expect(window.history.state).toEqual({ __NA: true, tree: "x" });
  });
});

