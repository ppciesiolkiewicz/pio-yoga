import { resolveSiteUrl } from "@repo/web/site";

export const site = {
  name: "Tangent",
  url: resolveSiteUrl(),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@attunr.com",
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || "",
  googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  calUrl: {
    en: process.env.NEXT_PUBLIC_CAL_URL_EN || "",
    pl: process.env.NEXT_PUBLIC_CAL_URL_PL || "",
  },
} as const;
