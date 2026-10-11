import { NextResponse, type NextRequest } from "next/server";
import type { Experiments } from "../experiments";
import { decideRoute, EXP_COOKIE, LOCALE_COOKIE } from "./decide";

/**
 * Next middleware for Tangent and Helpful Machines. In each app:
 *   export default createRoutingMiddleware({ experiments });
 *   export const config = { matcher: ["/((?!api|_next|_vercel|ingest|og|.*\\..*).*)"] };
 */
export function createRoutingMiddleware(opts: { experiments: Experiments; random?: () => number }) {
  return function middleware(req: NextRequest): NextResponse {
    const decision = decideRoute({
      pathname: req.nextUrl.pathname,
      search: req.nextUrl.search,
      userAgent: req.headers.get("user-agent"),
      country: req.headers.get("x-vercel-ip-country"),
      cookies: { locale: req.cookies.get(LOCALE_COOKIE)?.value, exp: req.cookies.get(EXP_COOKIE)?.value },
      experiments: opts.experiments,
      random: opts.random,
    });
    if (decision.kind === "pass") return NextResponse.next();

    let res: NextResponse;
    if (decision.kind === "redirect") {
      res = NextResponse.redirect(new URL(decision.location, req.url), decision.status);
    } else {
      const url = req.nextUrl.clone();
      url.pathname = decision.pathname;
      res = NextResponse.rewrite(url);
    }
    const secure = req.nextUrl.protocol === "https:";
    for (const c of decision.setCookies) {
      res.cookies.set(c.name, c.value, { maxAge: c.maxAge, path: "/", sameSite: "lax", secure });
    }
    return res;
  };
}
