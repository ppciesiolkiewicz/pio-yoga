import { createHash } from "node:crypto";

/** CSP source for an inline script, e.g. script-src 'self' 'sha256-…'. */
export function cspHash(script: string): string {
  return `'sha256-${createHash("sha256").update(script, "utf8").digest("base64")}'`;
}
