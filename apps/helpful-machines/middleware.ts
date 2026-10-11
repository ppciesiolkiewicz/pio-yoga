import { createRoutingMiddleware } from "@repo/web/middleware";
import { experiments } from "./experiments";

export default createRoutingMiddleware({ experiments });

export const config = {
  matcher: ["/((?!(?:api|_next|_vercel|ingest|og)(?:/|$)|.*\\..*).*)"],
};
