/** Decorative geometric shapes + a glass panel framing the hero. Purely visual: hidden from assistive tech. */
export function HeroDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* left side: large, heavily blurred washes of colour */}
      <div className="absolute -left-48 -top-40 size-[36rem] rounded-full bg-accent/20 blur-[120px]" />
      <div className="absolute -left-32 top-48 size-96 rounded-full bg-highlight/25 blur-[100px]" />
      {/* left glass cluster, partly off-screen */}
      <div className="hm-glass absolute -left-20 top-96 hidden size-44 rotate-6 rounded-card sm:block" />
      <div className="hm-glass absolute left-16 top-132 hidden size-16 rounded-full sm:block" />

      {/* right side */}
      <div className="absolute -right-48 -top-24 size-[40rem] rounded-full bg-highlight/15 blur-[120px]" />
      <div className="absolute -right-16 top-72 size-80 rounded-full bg-[#5fd0c2]/25 blur-[100px]" />
      {/* purple: wide soft halo + a core at the original intensity */}
      <div className="absolute right-24 -top-48 size-144 rounded-full bg-[#b98cff]/25 blur-[160px]" />
      <div className="absolute right-60 -top-2 size-48 rounded-full bg-[#b98cff]/30 blur-[60px]" />
      {/* right glass cluster: shapes interlock like puzzle pieces, half off-screen */}
      <div className="hm-glass absolute -right-32 top-24 hidden size-64 rounded-full sm:block" />
      <div className="hm-glass absolute -right-24 top-[21rem] hidden size-48 rotate-12 rounded-card sm:block" />
      <div className="hm-glass absolute right-28 top-[19rem] hidden size-14 rounded-full sm:block" />
      <div className="hm-glass absolute -right-10 top-4 hidden size-20 -rotate-12 rounded-2xl sm:block" />
    </div>
  );
}
