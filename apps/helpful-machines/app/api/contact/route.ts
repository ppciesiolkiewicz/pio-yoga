import { createContactHandler, resendSender } from "@repo/web/contact";

export const runtime = "nodejs";

const apiKey = process.env.RESEND_API_KEY;
const to = process.env.CONTACT_TO_EMAIL;

/** Without RESEND_API_KEY and CONTACT_TO_EMAIL the handler answers 503 and the form shows the email address. */
export const POST = createContactHandler({
  send: apiKey && to ? resendSender(apiKey) : null,
  to: to ?? "",
  from: process.env.CONTACT_FROM_EMAIL || "Helpful Machines <hello@attunr.com>",
  siteName: "Helpful Machines",
});
