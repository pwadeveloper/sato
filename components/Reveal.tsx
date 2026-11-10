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
  /** Position among siblings revealed together; each step adds 80ms. */
  index?: number;
  /** `stagger` animates each direct child in turn instead of the block. */
  mode?: "fade" | "stagger";
  id?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Marks a block to rise into place as it enters the viewport.
 *
 * A server component: it renders the children with a `data-anim` attribute,
 * and `MotionRuntime` builds the animation. Under reduced motion, or with no
 * script, it is simply the block.
 */
export function Reveal({
  children,
  as = "div",
  index = 0,
  mode = "fade",
  id,
  className,
  style,
}: RevealProps) {
  const Tag = TAGS[as];
  return (
    <Tag
      id={id}
      data-anim={mode}
      data-delay={index ? Math.min(index, 8) * 80 : undefined}
      className={cn(className)}
      style={style}
    >
      {children}
    </Tag>
  );
}
