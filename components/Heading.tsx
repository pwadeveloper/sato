import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

const SIZES = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-lg font-medium tracking-[-0.01em]",
} as const;

export interface HeadingProps {
  /** Semantic level. Kept independent of visual size. */
  level: 1 | 2 | 3 | 4;
  text: string;
  size?: keyof typeof SIZES;
  id?: string;
  className?: string;
  /**
   * Rise in a line at a time as it enters the viewport (GSAP SplitText, in
   * `MotionRuntime`). The text is in the HTML either way.
   */
  split?: boolean;
  /** Milliseconds before the first line, when `split` is set. */
  splitDelay?: number;
}

/**
 * Headings are sentence case (CLAUDE.md rule 6). Display, h1 and h2 are set
 * in Instrument Serif by the size class itself (see globals.css); h3 and h4
 * are Geist. `level` and `size` are separate so a visually large `h2` never
 * has to become an `h1` — one `h1` per page.
 *
 * The one heading scale: `h1` the page title, `h2` the sections, `h3` every
 * subsection, `h4` a group inside an `h3` — see docs/heading-audit.md.
 */
export function Heading({
  level,
  text,
  size,
  id,
  className,
  split = false,
  splitDelay = 0,
}: HeadingProps) {
  const Tag = `h${level}` as const;
  const resolved = size ?? (`h${level}` as keyof typeof SIZES);

  return (
    <Tag
      id={id}
      data-anim={split ? "lines" : undefined}
      data-delay={split && splitDelay ? splitDelay : undefined}
      className={cn("text-balance", SIZES[resolved], className)}
    >
      <RichText text={text} />
    </Tag>
  );
}
