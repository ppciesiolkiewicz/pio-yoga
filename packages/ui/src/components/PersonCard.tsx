import Image from "next/image";
import { Card } from "./Card";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0]!.charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : "";
  return (first + last).toUpperCase();
}

export function PersonCard({
  name,
  role,
  bio,
  photo,
  links = [],
  headingLevel: Heading = "h3",
}: {
  name: string;
  role: string;
  bio?: string;
  photo?: { src: string; alt: string };
  links?: { label: string; href: string }[];
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Card as="article" className="flex h-full flex-col gap-4">
      {photo ? (
        <Image src={photo.src} alt={photo.alt} width={96} height={96} className="size-24 rounded-full object-cover" />
      ) : (
        <span aria-hidden="true" className="grid size-24 place-items-center rounded-full bg-accent font-display text-2xl font-bold text-accent-ink">
          {initials(name)}
        </span>
      )}
      <div>
        <Heading className="font-display text-xl font-bold">{name}</Heading>
        <p className="text-muted">{role}</p>
      </div>
      {bio && <p>{bio}</p>}
      {links.length > 0 && (
        <ul className="mt-auto flex flex-wrap gap-x-4">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="inline-flex min-h-11 items-center font-bold underline underline-offset-4" rel="noopener noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
