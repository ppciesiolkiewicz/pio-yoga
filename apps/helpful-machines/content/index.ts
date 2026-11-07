import type { Locale } from "@repo/web/locale";
import { en, type Content } from "./en";

export type { Content } from "./en";

export function getContent(_locale: Locale): Content {
  return en;
}
