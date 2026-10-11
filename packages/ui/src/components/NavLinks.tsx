"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { splitLocale, stripInternalPrefix } from "@repo/web/locale";
import { cn } from "../cn";

export type NavItem = { href: string; label: string };

export function NavLinks({
  items,
  buckets,
  orientation = "horizontal",
  onNavigate,
}: {
  items: NavItem[];
  buckets: readonly string[];
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
}) {
  const current = stripInternalPrefix(usePathname() ?? "/", buckets).rest;
  return (
    <ul className={cn("flex gap-1", orientation === "vertical" ? "flex-col items-start" : "items-center")}>
      {items.map((item) => {
        const target = splitLocale(item.href).rest;
        const active = current === target || (target !== "/" && current.startsWith(`${target}/`));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "inline-flex min-h-11 items-center rounded-card px-3 font-bold no-underline hover:underline hover:underline-offset-8",
                active && "underline decoration-accent decoration-4 underline-offset-8",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
