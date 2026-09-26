import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

const TONES = {
  /** Sector pills. The deeper lozenge tone, so a pill never reads as a button. */
  deep: "bg-brand text-white",
  brand: "bg-brand text-white",
  survey: "bg-survey text-asphalt",
  outline: "border border-steel text-steel-ink",
} as const;

export interface TagProps {
  label: string;
  tone?: keyof typeof TONES;
  className?: string;
}

/**
 * The only rounded shape in the system. The pill deliberately quotes the logo's
 * lozenge, so roundness reads as a reference to the mark rather than a default.
 */
export function Tag({ label, tone = "deep", className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-2xs font-semibold uppercase tracking-[0.06em] wdth-body",
        TONES[tone],
        className,
      )}
    >
      <RichText text={label} />
    </span>
  );
}
