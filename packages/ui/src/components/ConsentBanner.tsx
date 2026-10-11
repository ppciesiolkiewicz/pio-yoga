"use client";

import { useEffect, useState } from "react";
import { CONSENT_COOKIE, parseConsent, type Consent } from "@repo/web/consent";
import { buttonClasses } from "./Button";

export const CONSENT_EVENT = "hm:consent";
export const CONSENT_OPEN_EVENT = "hm:consent-open";

export function readConsent(): Consent | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE}=([^;]*)`));
  return parseConsent(match ? decodeURIComponent(match[1]!) : undefined);
}

export function writeConsent(value: Consent) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

export function ConsentBanner({
  labels,
  policyHref,
}: {
  labels: { label: string; text: string; accept: string; decline: string; policy: string };
  policyHref: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(readConsent() === null);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;
  const choose = (value: Consent) => {
    writeConsent(value);
    setOpen(false);
  };
  // Same class on both buttons: accepting must not be more prominent than declining.
  const choiceClass = buttonClasses("secondary");
  return (
    <div
      role="region"
      aria-label={labels.label}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-card border-2 border-line bg-surface p-5 text-ink shadow-card sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <p>
        {labels.text}{" "}
        <a href={policyHref} className="font-bold underline underline-offset-4">
          {labels.policy}
        </a>
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className={choiceClass} onClick={() => choose("granted")}>
          {labels.accept}
        </button>
        <button type="button" className={choiceClass} onClick={() => choose("denied")}>
          {labels.decline}
        </button>
      </div>
    </div>
  );
}

export function ConsentSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center underline underline-offset-4"
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
    >
      {label}
    </button>
  );
}
