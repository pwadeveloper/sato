import { cn } from "@/lib/cn";

export interface ScaleRuleProps {
  className?: string;
  /** Height of the band in pixels; ticks scale within it. */
  height?: number;
}

/**
 * A drawing's scale bar: minor ticks every 8px, a major one every fifth.
 *
 * Purely decorative — it marks the edge of a photograph band or a dark band
 * the way a scale marks the edge of a plan, and it is drawn in
 * `currentColor` so the band decides how loud it is. Hidden from assistive
 * technology.
 */
export function ScaleRule({ className, height = 10 }: ScaleRuleProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn("block w-full text-steel", className)}
      height={height}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="scale-rule-ticks" width="40" height={height} patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height={height} fill="currentColor" />
          <rect x="8" y={height * 0.5} width="1" height={height * 0.5} fill="currentColor" />
          <rect x="16" y={height * 0.5} width="1" height={height * 0.5} fill="currentColor" />
          <rect x="24" y={height * 0.5} width="1" height={height * 0.5} fill="currentColor" />
          <rect x="32" y={height * 0.5} width="1" height={height * 0.5} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height={height} fill="url(#scale-rule-ticks)" />
    </svg>
  );
}
