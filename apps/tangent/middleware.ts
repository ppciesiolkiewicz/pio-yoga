import { createRoutingMiddleware } from "@repo/web/middleware";
import { experiments } from "./experiments";
import { allPaths } from "./lib/routes";

const known = new Set(allPaths);

/** Unknown paths go to the root 404 (app/not-found.tsx), a full branded page. */
export default createRoutingMiddleware({ experiments, isKnownPath: (rest) => known.has(rest) });

export const config = {
  matcher: ["/((?!(?:api|_next|_vercel|ingest|og)(?:/|$)|.*\\..*).*)"],
};
