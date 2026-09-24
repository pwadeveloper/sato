import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const TONES = {
  concrete: "bg-concrete text-asphalt",
  white: "bg-white text-asphalt",
  asphalt: "bg-asphalt text-concrete",
  green: "bg-green-deep text-white",
} as const;

export type SectionTone = keyof typeof TONES;

export interface SectionProps {
  children: ReactNode;
  tone?: SectionTone;
  id?: string;
  /** Renders as `<section>` by default; pass `div` for a non-landmark block. */
  as?: "section" | "div";
  /** Labels the section for assistive tech; point it at the heading's id. */
  labelledBy?: string;
  className?: string;
}

export function Section({
  children,
  tone = "concrete",
  id,
  as: Tag = "section",
  labelledBy,
  className,
}: SectionProps) {
  return (
    <Tag id={id} aria-labelledby={labelledBy} className={cn("section-y", TONES[tone], className)}>
      {children}
    </Tag>
  );
}
