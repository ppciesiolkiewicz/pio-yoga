/** Native <details>: zero JS, keyboard accessible, answers present in the HTML for SEO. */
export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="border-y-2 border-line">
      {items.map((item) => (
        <details key={item.question} className="group border-b-2 border-line last:border-b-0">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg font-bold [&::-webkit-details-marker]:hidden">
            {item.question}
            <span aria-hidden="true" className="text-2xl transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="pb-5 text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
