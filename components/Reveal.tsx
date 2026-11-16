import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

const TAGS = {
  div: "div",
  section: "section",
  li: "li",
  p: "p",
  figure: "figure",
  article: "article",
} as const;

export interface RevealProps {
  children: ReactNode;
  as?: keyof typeof TAGS;
  /** Kept for API compatibility with the NewDesign branch; unused here. */
  index?: number;
  mode?: "fade" | "stagger";
  id?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * A plain wrapper. On the NewDesign branch this marks a block for a scroll
 * reveal; this design has no scroll motion, so it renders the block as is.
 * It exists so components shared with that branch need no edits to run here.
 */
export function Reveal({ children, as = "div", id, className, style }: RevealProps) {
  const Tag = TAGS[as];
  return (
    <Tag id={id} className={cn(className)} style={style}>
      {children}
    </Tag>
  );
}
