/** Decorative geometric shapes + a glass panel framing the hero. Purely visual: hidden from assistive tech. */
export function HeroDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* left side */}
      <div className="absolute -left-24 -top-16 size-72 rounded-full bg-accent/25 blur-3xl" />
      <div className="absolute -left-10 top-40 size-24 rotate-12 rounded-card bg-highlight/40 blur-xl" />
      <div className="hm-glass absolute left-8 top-[26rem] hidden size-28 rotate-6 rounded-card sm:block" />

      {/* right side */}
      <div className="absolute -right-20 top-8 size-80 rounded-full bg-highlight/20 blur-3xl" />
      <div className="absolute right-10 top-64 size-16 rounded-full bg-[#5fd0c2]/40 blur-lg" />
      <div className="absolute right-24 top-6 size-20 rotate-45 rounded-2xl bg-[#b98cff]/30 blur-xl" />
      <div className="hm-glass absolute -right-6 top-32 hidden size-32 rounded-full sm:block" />
    </div>
  );
}
