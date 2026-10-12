/** Language-neutral facts. Roles and bios live in content/<locale>.ts under people.items[id]. */
export type Person = {
  id: "piotr";
  name: string;
  kind: "lead" | "collaborator";
  /** Shown on the site only when true (written consent for name, photo and bio). */
  consent: boolean;
  photo?: { src: string };
  links: { label: string; href: string }[];
};

export const people: Person[] = [
  {
    id: "piotr",
    name: "Piotr Ciesiolkiewicz",
    kind: "lead",
    consent: true,
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/piotr-ciesiolkiewicz" },
      { label: "GitHub", href: "https://github.com/ppciesiolkiewicz" },
    ],
  },
];

export function visiblePeople(): Person[] {
  return people.filter((person) => person.consent);
}
