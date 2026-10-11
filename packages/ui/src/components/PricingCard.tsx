import { cn } from "../cn";
import { Card } from "./Card";
import { ButtonLink, type CtaLink } from "./SmartLink";

export function PricingCard({
  name,
  price,
  summary,
  features,
  cta,
  featured = false,
  headingLevel: Heading = "h3",
  newTabLabel,
}: {
  name: string;
  price: string;
  summary: string;
  features: string[];
  cta?: CtaLink;
  featured?: boolean;
  headingLevel?: "h2" | "h3";
  newTabLabel?: string;
}) {
  return (
    <Card as="article" className={cn("flex h-full flex-col", featured && "border-4")}>
      <Heading className="font-display text-2xl font-extrabold">{name}</Heading>
      <p className="mt-2 font-display text-3xl font-extrabold">{price}</p>
      <p className="mt-3 text-muted">{summary}</p>
      <ul className="mt-6 grid gap-2">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span aria-hidden="true" className="font-bold text-accent-text">
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>
      {cta && (
        <div className="mt-auto pt-8">
          <ButtonLink link={{ ...cta, trackLocation: "pricing" }} variant={featured ? "primary" : "secondary"} newTabLabel={newTabLabel} />
        </div>
      )}
    </Card>
  );
}
