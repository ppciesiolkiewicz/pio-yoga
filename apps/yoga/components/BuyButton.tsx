"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

type Labels = { buy: string; buying: string; unavailable: string; error: string };

export default function BuyButton({ locale, t }: { locale: Locale; t: Labels }) {
  const [state, setState] = useState<"idle" | "loading" | "error" | "unavailable">("idle");

  async function onBuy() {
    setState("loading");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      if (res.status === 503) return setState("unavailable");
      const data = (await res.json()) as { url?: string };
      if (!res.ok || !data.url) return setState("error");
      window.location.assign(data.url);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="buy">
      <button className="btn primary" type="button" onClick={onBuy} disabled={state === "loading"}>
        {state === "loading" ? t.buying : t.buy}
      </button>
      {state === "unavailable" && <p role="alert" className="form-msg">{t.unavailable}</p>}
      {state === "error" && <p role="alert" className="form-msg">{t.error}</p>}
    </div>
  );
}
