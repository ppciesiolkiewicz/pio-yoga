/** Soft blurred colour washes behind the hero. Purely visual: hidden from assistive tech. */
export function HeroDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* left side */}
      <div className="absolute -left-48 -top-40 size-[36rem] rounded-full bg-accent/20 blur-[120px]" />
      <div className="absolute -left-32 top-48 size-96 rounded-full bg-highlight/25 blur-[100px]" />

      {/* right side */}
      <div className="absolute -right-48 -top-24 size-[40rem] rounded-full bg-highlight/15 blur-[120px]" />
      <div className="absolute -right-16 top-72 size-80 rounded-full bg-[#5fd0c2]/25 blur-[100px]" />
      {/* purple: wide soft halo + a core at the original intensity */}
      <div className="absolute right-24 -top-48 size-144 rounded-full bg-[#b98cff]/25 blur-[160px]" />
      <div className="absolute right-60 -top-2 size-48 rounded-full bg-[#b98cff]/30 blur-[60px]" />
    </div>
  );
}
