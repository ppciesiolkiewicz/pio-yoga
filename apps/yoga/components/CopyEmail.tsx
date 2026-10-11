"use client";

import { useRef, useState } from "react";

export default function CopyEmail({ email, copy, copied }: { email: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLElement>(null);

  function selectText() {
    const el = ref.current;
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      selectText();
    }
  }

  return (
    <div className="mail">
      <a href={`mailto:${email}`}>
        <code ref={ref}>{email}</code>
      </a>
      <button className="copy" type="button" onClick={onCopy}>
        {done ? copied : copy}
      </button>
    </div>
  );
}
