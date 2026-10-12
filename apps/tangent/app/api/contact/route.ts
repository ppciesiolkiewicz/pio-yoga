import { createContactHandler, resendSender } from "@repo/web/contact";

export const runtime = "nodejs";

const apiKey = process.env.RESEND_API_KEY;
const to = process.env.CONTACT_TO_EMAIL;

export const POST = createContactHandler({
  send: apiKey && to ? resendSender(apiKey) : null,
  to: to ?? "",
  from: process.env.CONTACT_FROM_EMAIL || "Tangent <hello@attunr.com>",
  siteName: "Tangent",
});
