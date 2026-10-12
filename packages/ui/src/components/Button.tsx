import type { ButtonHTMLAttributes } from "react";
import { cn } from "../cn";

export type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 font-display font-bold no-underline transition-transform duration-150 disabled:opacity-60";
const variants: Record<Variant, string> = {
  primary: "rounded-button bg-ink px-5 py-3 text-bg shadow-cta hover:-translate-y-0.5 active:translate-y-0",
  secondary: "rounded-button border-2 border-control bg-surface px-5 py-3 text-ink shadow-card hover:-translate-y-0.5 active:translate-y-0",
  ghost: "px-1 py-2 text-ink underline decoration-2 underline-offset-4 hover:decoration-accent",
};

export function buttonClasses(variant: Variant = "primary"): string {
  return cn(base, variants[variant]);
}

export function Button({
  variant = "primary",
  type = "button",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={cn(buttonClasses(variant), className)} {...props} />;
}
