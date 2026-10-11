export function ChipList({ items, label }: { items: string[]; label?: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-full border-2 border-line bg-surface px-3 py-1 text-sm font-bold">
          {item}
        </li>
      ))}
    </ul>
  );
}
