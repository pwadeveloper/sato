import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

const SIZES = {
  display: "text-display wdth-display",
  h1: "text-h1 wdth-heading",
  h2: "text-h2 wdth-heading",
  h3: "text-h3 wdth-heading",
  h4: "text-xl font-semibold wdth-heading",
} as const;

export interface HeadingProps {
  /** Semantic level. Kept independent of visual size. */
  level: 1 | 2 | 3 | 4;
  text: string;
  size?: keyof typeof SIZES;
  id?: string;
  className?: string;
}

/**
 * Headings are sentence case (CLAUDE.md rule 5) and set in Archivo's expanded
 * widths. `level` and `size` are separate so a visually large `h2` never has to
 * become an `h1` — one `h1` per page.
 */
export function Heading({ level, text, size, id, className }: HeadingProps) {
  const Tag = `h${level}` as const;
  const resolved = size ?? (`h${level}` as keyof typeof SIZES);

  return (
    <Tag id={id} className={cn("text-balance", SIZES[resolved], className)}>
      <RichText text={text} />
    </Tag>
  );
}
