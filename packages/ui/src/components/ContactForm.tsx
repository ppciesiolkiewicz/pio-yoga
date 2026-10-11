"use client";

import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import type { Locale } from "@repo/web/locale";
import { track } from "../events";
import { Button } from "./Button";

const FIELD_KEYS = ["name", "email", "company", "message"] as const;
type FieldKey = (typeof FIELD_KEYS)[number];
const ERROR_KEYS = ["validation", "rate_limited", "send_failed", "unavailable", "bad_request"] as const;
export type ContactErrorKey = (typeof ERROR_KEYS)[number];
const isErrorKey = (v: unknown): v is ContactErrorKey => typeof v === "string" && (ERROR_KEYS as readonly string[]).includes(v);

export type ContactFormLabels = {
  name: string;
  email: string;
  company: string;
  message: string;
  submit: string;
  sending: string;
  sent: string;
  errorSummary: string;
  emailFallback: string;
  fieldErrors: Record<FieldKey, string>;
  errors: Record<ContactErrorKey, string>;
};

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; error: ContactErrorKey; fields: Partial<Record<FieldKey, string>> };

const inputClass = "min-h-11 w-full rounded-card border-2 border-line bg-surface px-3 py-2 text-ink";

function Field({
  id,
  label,
  error,
  multiline,
  ...props
}: { id: string; label: string; error?: string; multiline?: boolean } & InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const errorId = `${id}-error`;
  const shared = { id, "aria-invalid": error ? true : undefined, "aria-describedby": error ? errorId : undefined, className: inputClass };
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      {multiline ? (
        <textarea rows={6} {...shared} {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input {...shared} {...(props as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {error && (
        <p id={errorId} className="text-sm font-bold text-accent-text">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm({ locale, labels, email, action = "/api/contact" }: { locale: Locale; labels: ContactFormLabels; email: string; action?: string }) {
  const [renderedAt, setRenderedAt] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHydrated(true);
    setRenderedAt(String(Date.now()));
    const query = new URLSearchParams(window.location.search);
    const error = query.get("error");
    if (query.get("sent") === "1") setStatus({ kind: "sent" });
    else if (isErrorKey(error)) setStatus({ kind: "error", error, fields: {} });
  }, []);

  useEffect(() => {
    if (status.kind === "error") alertRef.current?.focus();
  }, [status]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch(action, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: unknown; fields?: Record<string, string> };
      if (res.ok && body.ok) {
        form.reset();
        setStatus({ kind: "sent" });
        track("form_submitted", { success: true });
        return;
      }
      const fields: Partial<Record<FieldKey, string>> = {};
      for (const key of FIELD_KEYS) if (body.fields?.[key]) fields[key] = labels.fieldErrors[key];
      setStatus({ kind: "error", error: isErrorKey(body.error) ? body.error : "send_failed", fields });
    } catch {
      setStatus({ kind: "error", error: "send_failed", fields: {} });
    }
    track("form_submitted", { success: false });
  }

  const fields = status.kind === "error" ? status.fields : {};
  const fieldEntries = Object.entries(fields) as [FieldKey, string][];
  const showEmail = status.kind === "error" && (status.error === "unavailable" || status.error === "send_failed");

  const emailFallback = (
    <p className="mt-2">
      {labels.emailFallback}{" "}
      <a href={`mailto:${email}`} className="font-bold underline underline-offset-4">
        {email}
      </a>
    </p>
  );

  return (
    <form method="post" action={action} onSubmit={onSubmit} className="grid gap-5">
      {/* Without JS the API redirects to ?sent=1#contact-sent (or #contact-error-<key>); :target reveals the message. */}
      {!hydrated && (
        <>
          <p id="contact-sent" role="status" className="hidden rounded-card border-2 border-line bg-highlight/40 p-4 font-bold target:block">
            {labels.sent}
          </p>
          {ERROR_KEYS.map((key) => (
            <div key={key} id={`contact-error-${key}`} role="alert" className="hidden rounded-card border-2 border-line bg-surface p-4 target:block">
              <p className="font-bold">{labels.errors[key]}</p>
              {(key === "unavailable" || key === "send_failed") && emailFallback}
            </div>
          ))}
        </>
      )}
      {status.kind === "sent" && (
        <p role="status" className="rounded-card border-2 border-line bg-highlight/40 p-4 font-bold">
          {labels.sent}
        </p>
      )}
      {status.kind === "error" && (
        <div ref={alertRef} role="alert" tabIndex={-1} className="rounded-card border-2 border-line bg-surface p-4">
          <p className="font-bold">{fieldEntries.length > 0 ? labels.errorSummary : labels.errors[status.error]}</p>
          {fieldEntries.length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {fieldEntries.map(([key, message]) => (
                <li key={key}>
                  <a href={`#contact-${key}`} className="underline underline-offset-4">
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {showEmail && emailFallback}
        </div>
      )}
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="t" value={renderedAt} />
      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <Field id="contact-name" name="name" label={labels.name} autoComplete="name" required maxLength={100} error={fields.name} />
      <Field id="contact-email" name="email" type="email" label={labels.email} autoComplete="email" required maxLength={200} error={fields.email} />
      <Field id="contact-company" name="company" label={labels.company} autoComplete="organization" maxLength={150} error={fields.company} />
      <Field id="contact-message" name="message" label={labels.message} multiline required minLength={10} maxLength={5000} error={fields.message} />
      <div>
        <Button type="submit" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? labels.sending : labels.submit}
        </Button>
      </div>
    </form>
  );
}
