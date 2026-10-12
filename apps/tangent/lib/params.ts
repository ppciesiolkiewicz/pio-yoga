import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { allBuckets, parseBucket } from "@repo/web/experiments";
import { isLocale } from "@repo/web/locale";
import { getContent } from "@/content";
import { designFor, experiments } from "@/experiments";

export type RouteParams = { bucket: string; locale: string };
export const buckets = allBuckets(experiments);

export async function resolveParams(params: Promise<RouteParams>) {
  const { bucket, locale } = await params;
  const assignment = parseBucket(experiments, bucket);
  if (!isLocale(locale) || !assignment) notFound();
  setRequestLocale(locale);
  return { locale, assignment, design: designFor(assignment.design), t: getContent(locale) };
}
