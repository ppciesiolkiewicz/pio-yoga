import { describe, expect, it, vi } from "vitest";
import { buildEmail, createContactHandler, createRateLimiter, isSpam, resendSender, type EmailMessage } from "../src/contact";

const NOW = 1_800_000_000_000;
const valid = {
  name: "Zażółć Gęślą",
  email: "ania@example.pl",
  company: "Jaźń sp. z o.o.",
  message: "Potrzebujemy pomocy z arkuszami i automatyzacją.",
  locale: "pl",
  t: String(NOW - 60_000),
};
const setup = (opts: { send?: ((m: EmailMessage) => Promise<void>) | null } = {}) => {
  const sent: EmailMessage[] = [];
  const send = opts.send === undefined ? async (m: EmailMessage) => void sent.push(m) : opts.send;
  const handler = createContactHandler({ send, to: "piotr@example.com", from: "site@attunr.com", siteName: "Helpful Machines", now: () => NOW });
  return { handler, sent };
};
const json = (body: unknown, ip = "1.1.1.1") =>
  new Request("https://attunr.com/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
const form = (body: Record<string, string>) =>
  new Request("https://attunr.com/api/contact", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", "x-forwarded-for": "2.2.2.2" },
    body: new URLSearchParams(body).toString(),
  });

describe("isSpam", () => {
  it("flags a filled honeypot", () => expect(isSpam({ honeypot: "http://spam", renderedAt: undefined, now: NOW })).toBe(true));
  it("flags submissions faster than 3 seconds", () => expect(isSpam({ honeypot: "", renderedAt: String(NOW - 1000), now: NOW })).toBe(true));
  it("allows slower submissions and missing timestamps (no-JS)", () => {
    expect(isSpam({ honeypot: "", renderedAt: String(NOW - 5000), now: NOW })).toBe(false);
    expect(isSpam({ honeypot: undefined, renderedAt: undefined, now: NOW })).toBe(false);
  });
  it("ignores timestamps from the future (clock skew)", () =>
    expect(isSpam({ honeypot: "", renderedAt: String(NOW + 60_000), now: NOW })).toBe(false));
});

describe("buildEmail", () => {
  it("keeps diacritics and strips line breaks from the subject", () => {
    const m = buildEmail(
      { name: "Zażółć\r\nBcc: evil@x.com", email: "a@b.co", company: "", message: "Cześć", locale: "pl" },
      { to: "me@x.com", from: "site@x.com", siteName: "Tangent" },
    );
    expect(m.subject).toBe("[Tangent] Enquiry from Zażółć Bcc: evil@x.com");
    expect(m.subject).not.toMatch(/[\r\n]/);
    expect(m.replyTo).toBe("a@b.co");
    expect(m.text).toContain("Cześć");
    expect(m.text).toContain("Market: pl");
  });
});

describe("createContactHandler (JSON)", () => {
  it("sends a valid enquiry", async () => {
    const { handler, sent } = setup();
    const res = await handler(json(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ to: "piotr@example.com", from: "site@attunr.com", replyTo: "ania@example.pl" });
    expect(sent[0]!.text).toContain("Zażółć Gęślą");
  });

  it("returns field errors without sending", async () => {
    const { handler, sent } = setup();
    const res = await handler(json({ ...valid, email: "nope", message: "hi" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("validation");
    expect(Object.keys(body.fields).sort()).toEqual(["email", "message"]);
    expect(sent).toHaveLength(0);
  });

  it("returns 400 for malformed JSON", async () => {
    const { handler } = setup();
    const res = await handler(json("{not json"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: "bad_request" });
  });

  it("fakes success for spam", async () => {
    const { handler, sent } = setup();
    const res = await handler(json({ ...valid, website: "http://spam" }));
    expect(res.status).toBe(200);
    expect(sent).toHaveLength(0);
  });

  it("returns 503 when email is not configured", async () => {
    const { handler } = setup({ send: null });
    const res = await handler(json(valid));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false, error: "unavailable" });
  });

  it("returns 502 when sending fails", async () => {
    const { handler } = setup({ send: async () => Promise.reject(new Error("down")) });
    const res = await handler(json(valid));
    expect(res.status).toBe(502);
  });

  it("rate-limits per IP", async () => {
    const { handler } = setup();
    for (let i = 0; i < 5; i++) expect((await handler(json(valid, "9.9.9.9"))).status).toBe(200);
    expect((await handler(json(valid, "9.9.9.9"))).status).toBe(429);
    expect((await handler(json(valid, "8.8.8.8"))).status).toBe(200);
  });
});

describe("createContactHandler (no-JS form)", () => {
  it("redirects back to the polish contact page on success", async () => {
    const { handler, sent } = setup();
    const res = await handler(form(valid));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("https://attunr.com/pl/contact?sent=1#contact-sent");
    expect(sent).toHaveLength(1);
  });
  it("redirects to the english contact page with an error", async () => {
    const { handler } = setup();
    const res = await handler(form({ ...valid, locale: "en", email: "bad" }));
    expect(res.headers.get("location")).toBe("https://attunr.com/contact?error=validation#contact-error-validation");
  });
  it("accepts a submission without the JS timestamp", async () => {
    const { handler, sent } = setup();
    const { t: _t, ...noTimestamp } = valid;
    await handler(form(noTimestamp));
    expect(sent).toHaveLength(1);
  });
});

describe("createRateLimiter", () => {
  it("frees slots after the window", () => {
    let t = 0;
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t });
    expect(rl.hit("a")).toBe(true);
    expect(rl.hit("a")).toBe(false);
    t = 1001;
    expect(rl.hit("a")).toBe(true);
  });
});

describe("resendSender", () => {
  const msg = { to: "me@x.com", from: "site@x.com", replyTo: "a@b.co", subject: "S", text: "T" };
  it("posts to the Resend API", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    await resendSender("re_test", fetchImpl as unknown as typeof fetch)(msg);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test");
    expect(JSON.parse(init.body as string)).toEqual({ from: "site@x.com", to: ["me@x.com"], reply_to: "a@b.co", subject: "S", text: "T" });
  });
  it("throws on a non-2xx response", async () => {
    const fetchImpl = vi.fn(async () => new Response("no", { status: 422 }));
    await expect(resendSender("re_test", fetchImpl as unknown as typeof fetch)(msg)).rejects.toThrow(/422/);
  });
});
