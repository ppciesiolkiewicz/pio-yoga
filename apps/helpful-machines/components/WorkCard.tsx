import { Card } from "@repo/ui/Card";

export function WorkCard({
  client,
  sector,
  title,
  body,
  headingLevel: Heading = "h3",
}: {
  client: string;
  sector: string;
  title: string;
  body: string;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Card as="article" className="flex h-full flex-col">
      <p className="text-sm font-bold uppercase tracking-widest text-accent-text">{sector}</p>
      <Heading className="mt-2 font-display text-xl font-extrabold">{title}</Heading>
      <p className="mt-3 text-muted">{body}</p>
      <p className="mt-auto pt-4 text-sm font-bold">{client}</p>
    </Card>
  );
}
