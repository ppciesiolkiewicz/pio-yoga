import { notFound } from "next/navigation";

/** Any unknown path under a valid bucket/locale renders the localized 404 inside the layout. */
export default function MissingPage(): never {
  notFound();
}
