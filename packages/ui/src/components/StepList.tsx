import { Card } from "./Card";

export function StepList({ steps, headingLevel: Heading = "h3" }: { steps: { title: string; body: string }[]; headingLevel?: "h2" | "h3" }) {
  return (
    <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title}>
          <Card className="h-full">
            <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-accent font-display font-extrabold text-accent-ink">
              {index + 1}
            </span>
            <Heading className="mt-4 font-display text-xl font-extrabold">{step.title}</Heading>
            <p className="mt-2 text-muted">{step.body}</p>
          </Card>
        </li>
      ))}
    </ol>
  );
}
