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
  /** A running number, printed before the text as `01`. Replaces the marker. */
  index?: number;
  tone?: keyof typeof TONES;
  as?: "p" | "span" | "h2" | "h3" | "div";
  id?: string;
  className?: string;
}

/**
 * The label: mono, small, letterspaced, led by a small green square or a
 * running number. One component, so the voice cannot drift between pages.
 */
export function Eyebrow({ text, index, tone = "light", as: Tag = "p", id, className }: EyebrowProps) {
  return (
    <Tag id={id} className={cn("eyebrow flex items-center gap-3", TONES[tone], className)}>
      {index !== undefined ? (
        <span aria-hidden="true" className="tabular opacity-70">
          {String(index).padStart(2, "0")}
        </span>
      ) : (
        <span aria-hidden="true" className="size-1.5 shrink-0 bg-brand-bright" />
      )}
      <RichText text={text} />
    </Tag>
  );
}
