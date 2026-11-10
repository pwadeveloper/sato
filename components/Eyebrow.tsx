import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

const TONES = {
  light: "text-steel-ink",
  brand: "text-brand-ink",
  dark: "text-steel-light",
  darkBrand: "text-brand-light",
} as const;

export interface EyebrowProps {
  text: string;
  /** A running number, printed before the text as `01`. */
  index?: number;
  tone?: keyof typeof TONES;
  as?: "p" | "span" | "h2" | "h3" | "div";
  id?: string;
  className?: string;
}

/**
 * The survey annotation: mono, small, letterspaced, with an optional index.
 *
 * It labels a section the way a drawing labels a detail — what it is and
 * which one it is — and it is one component so the voice cannot drift
 * between pages.
 */
export function Eyebrow({ text, index, tone = "light", as: Tag = "p", id, className }: EyebrowProps) {
  return (
    <Tag id={id} className={cn("eyebrow flex items-baseline gap-3", TONES[tone], className)}>
      {index !== undefined ? (
        <span aria-hidden="true" className="tabular">
          {String(index).padStart(2, "0")}
        </span>
      ) : null}
      <RichText text={text} />
    </Tag>
  );
}
