function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Pio",
  url: siteUrl(),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@example.com",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || "",
  videoProgramEnabled: process.env.NEXT_PUBLIC_VIDEO_PROGRAM_ENABLED === "true",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
};

/** Booking link, falling back to the contact section when no Cal/Calendly URL is set. */
export function bookingHref(locale: string) {
  return site.bookingUrl || `/${locale}#contact`;
}
