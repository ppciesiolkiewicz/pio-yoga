import { Card } from "./Card";
import { cn } from "../cn";

type Step = { title: string; body: string; tag?: string };

export function StepList({
  steps,
  headingLevel: Heading = "h3",
  variant = "cards",
}: {
  steps: Step[];
  headingLevel?: "h2" | "h3";
  /** "timeline": numbered stops joined by a line (vertical on mobile, horizontal from lg). */
  variant?: "cards" | "timeline";
}) {
  if (variant === "timeline") {
    return (
      <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-8">
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          return (
            <li key={step.title} className="relative grid grid-cols-[3.5rem_1fr] gap-x-5 lg:block">
              {/* Connector to the next stop: down the badge column on mobile, across to the next column from lg. */}
              {!last && (
                <span
                  aria-hidden="true"
                  className="absolute top-14 -bottom-10 left-7 border-l-2 border-dashed border-line/40 lg:top-7 lg:right-[-2rem] lg:bottom-auto lg:left-14 lg:border-t-2 lg:border-l-0"
                />
              )}
              <span
                aria-hidden="true"
                data-step={index + 1}
                className={cn(
                  "relative grid size-14 place-items-center rounded-full border-2 border-line font-display text-2xl font-extrabold tabular-nums shadow-card",
                  last ? "hm-step-loop bg-accent text-accent-ink" : "bg-surface text-ink",
                )}
              >
                {index + 1}
              </span>
              <div className="lg:mt-6">
                {step.tag && (
                  <p className="inline-block rounded-full border border-line px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase">
                    {step.tag}
                  </p>
                )}
                <Heading className={cn("font-display text-2xl leading-tight font-extrabold tracking-tight", step.tag && "mt-3")}>
                  {step.title}
                </Heading>
                <p className="mt-2 text-pretty text-muted">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title}>
          <Card className="h-full">
            <span
              aria-hidden="true"
              className="hm-metallic-accent grid size-10 place-items-center rounded-full bg-accent font-display font-extrabold text-accent-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]"
            >
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
