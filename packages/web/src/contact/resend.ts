import type { SendEmail } from "./schema";

/** Sends through the Resend HTTP API (no SDK, keeps the route small). */
export function resendSender(apiKey: string, fetchImpl: typeof fetch = fetch): SendEmail {
  return async (m) => {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: m.from, to: [m.to], reply_to: m.replyTo, subject: m.subject, text: m.text }),
    });
    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
  };
}
