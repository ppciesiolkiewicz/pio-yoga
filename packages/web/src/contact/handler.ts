import { buildEmail, contactSchema, isSpam, type SendEmail } from "./schema";

type Limiter = { hit(key: string): boolean };

export function createRateLimiter(o: { limit: number; windowMs: number; now?: () => number }): Limiter {
  const now = o.now ?? Date.now;
  const hits = new Map<string, number[]>();
  return {
    hit(key) {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((x) => t - x < o.windowMs);
      if (recent.length >= o.limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(t);
      hits.set(key, recent);
      return true;
    },
  };
}

type Outcome = { status: number; body: Record<string, unknown>; query: string };

export function createContactHandler(o: {
  send: SendEmail | null;
  to: string;
  from: string;
  siteName: string;
  now?: () => number;
  rateLimiter?: Limiter;
}) {
  const now = o.now ?? Date.now;
  const limiter = o.rateLimiter ?? createRateLimiter({ limit: 5, windowMs: 10 * 60_000, now });

  return async function POST(req: Request): Promise<Response> {
    const isJson = (req.headers.get("content-type") ?? "").includes("application/json");
    let raw: Record<string, unknown> | null = null;
    try {
      const parsed: unknown = isJson ? await req.json() : Object.fromEntries(await req.formData());
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) raw = parsed as Record<string, unknown>;
    } catch {
      raw = null;
    }
    const locale = raw?.locale === "pl" ? "pl" : "en";

    const respond = ({ status, body, query }: Outcome): Response => {
      if (isJson) return Response.json(body, { status });
      // The #anchor reveals the matching message in the static page via CSS :target (works without JS).
      const anchor = query === "sent=1" ? "contact-sent" : `contact-error-${query.slice("error=".length)}`;
      const location = new URL(`${locale === "pl" ? "/pl" : ""}/contact?${query}#${anchor}`, req.url);
      return new Response(null, { status: 303, headers: { Location: location.toString() } });
    };

    if (!raw) return respond({ status: 400, body: { ok: false, error: "bad_request" }, query: "error=bad_request" });

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
    if (!limiter.hit(ip)) return respond({ status: 429, body: { ok: false, error: "rate_limited" }, query: "error=rate_limited" });

    if (isSpam({ honeypot: raw.website, renderedAt: raw.t, now: now() })) {
      return respond({ status: 200, body: { ok: true }, query: "sent=1" });
    }

    const result = contactSchema.safeParse(raw);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "form");
        fields[key] ??= issue.message;
      }
      return respond({ status: 400, body: { ok: false, error: "validation", fields }, query: "error=validation" });
    }

    if (!o.send) return respond({ status: 503, body: { ok: false, error: "unavailable" }, query: "error=unavailable" });

    try {
      await o.send(buildEmail(result.data, o));
    } catch {
      return respond({ status: 502, body: { ok: false, error: "send_failed" }, query: "error=send_failed" });
    }
    return respond({ status: 200, body: { ok: true }, query: "sent=1" });
  };
}
