import type { Locale } from "@repo/web/locale";
import { en, type Content } from "./en";
import { pl } from "./pl";

export type { Content } from "./en";

const dictionaries: Record<Locale, Content> = { en, pl };

export function getContent(locale: Locale): Content {
  return dictionaries[locale];
}
