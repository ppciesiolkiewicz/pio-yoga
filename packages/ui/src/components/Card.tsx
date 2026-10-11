import type { ElementType, ReactNode } from "react";
import { cn } from "../cn";

export function Card({ className, children, as: Tag = "div" }: { className?: string; children: ReactNode; as?: ElementType }) {
  return <Tag className={cn("rounded-card border-2 border-line bg-surface p-6 shadow-card", className)}>{children}</Tag>;
}
