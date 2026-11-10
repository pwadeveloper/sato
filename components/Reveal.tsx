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
  /**
   * Position among siblings revealed together. Each step extends the scroll
   * range (or delays the load-time fallback) so a row of cards arrives one
   * after another rather than as a block.
   */
  index?: number;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Marks a block to rise into place as it enters the viewport.
 *
 * A server component: it renders the children visible with a data attribute,
 * and `globals.css` does the rest with a scroll-driven animation. Nothing
 * here depends on JavaScript, which is why there is no hook and no `use
 * client`.
 */
export function Reveal({
  children,
  as = "div",
  index = 0,
  id,
  className,
  style,
}: RevealProps) {
  const Tag = TAGS[as];
  const stagger = {
    "--reveal-stagger": `${Math.min(index, 8) * 5}%`,
    "--reveal-delay": `${Math.min(index, 8) * 70}ms`,
  } as CSSProperties;

  return (
    <Tag id={id} data-reveal="" className={cn(className)} style={{ ...stagger, ...style }}>
      {children}
    </Tag>
  );
}
