export function Prose({ updated, sections }: { updated: string; sections: { heading: string; paragraphs: string[] }[] }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm text-muted">{updated}</p>
      {sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="font-display text-2xl font-extrabold">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-lg">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
