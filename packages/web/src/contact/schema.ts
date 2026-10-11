import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(200),
  company: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(10).max(5000),
  locale: z.enum(["en", "pl"]),
});
export type ContactInput = z.infer<typeof contactSchema>;

export type EmailMessage = { to: string; from: string; replyTo: string; subject: string; text: string };
export type SendEmail = (message: EmailMessage) => Promise<void>;

const MIN_FILL_MS = 3000;

/** Honeypot filled, or submitted under 3 s after the form mounted (timestamp set by client JS). */
export function isSpam(o: { honeypot: unknown; renderedAt: unknown; now: number }): boolean {
  if (typeof o.honeypot === "string" && o.honeypot.trim() !== "") return true;
  const t = Number(o.renderedAt);
  if (o.renderedAt === undefined || o.renderedAt === "" || !Number.isFinite(t)) return false;
  const elapsed = o.now - t;
  return elapsed >= 0 && elapsed < MIN_FILL_MS;
}

export function buildEmail(input: ContactInput, o: { to: string; from: string; siteName: string }): EmailMessage {
  const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();
  return {
    to: o.to,
    from: o.from,
    replyTo: input.email,
    subject: `[${o.siteName}] Enquiry from ${oneLine(input.name)}`,
    text: [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Company: ${input.company || "-"}`,
      `Market: ${input.locale}`,
      "",
      "Message:",
      input.message,
    ].join("\n"),
  };
}
