import { resolveSiteUrl } from "@repo/web/site";

export const site = {
  name: "Helpful Machines",
  design: "helpful-machines",
  /** Default domain until NEXT_PUBLIC_SITE_URL is set (buy it before launch). */
  url: resolveSiteUrl(undefined, "https://helpfulmachines.com.au"),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@helpfulmachines.com.au",
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || "",
  googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  calUrl: {
    en: process.env.NEXT_PUBLIC_CAL_URL_EN || "",
    pl: process.env.NEXT_PUBLIC_CAL_URL_PL || "",
  },
} as const;
