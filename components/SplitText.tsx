import type { CSSProperties, ReactNode } from "react";
import { Placeholder } from "./RichText";
import { parseConfirmable } from "@/lib/placeholders";

export interface SplitTextProps {
  text: string;
  /** Milliseconds between one word and the next. */
  step?: number;
  /** Milliseconds before the first word. */
  delay?: number;
}

/** One unit of the heading: a word, a placeholder, or the space between. */
type Unit =
  | { kind: "space"; value: string }
  | { kind: "word"; node: ReactNode };

/**
 * A heading that rises one word at a time.
 *
 * Each word sits in its own clipped line box and slides up into it; the CSS
 * is `[data-rise]` in globals.css, and the per-word delay is an inline custom
 * property, so the markup carries the rhythm and no script has to measure
 * anything. The clip boxes are padded past the glyph bounds and pulled back
 * with negative margins, so a descender is not cut and the line height is
 * unchanged.
 *
 * Placeholders are kept whole: a `{{CONFIRM: ...}}` is one unit, not a run
 * of highlighted words, so it still reads as a placeholder in review.
 */
export function SplitText({ text, step = 55, delay = 0 }: SplitTextProps) {
  const units: Unit[] = parseConfirmable(text).flatMap((segment) => {
    if (segment.kind === "placeholder") {
      return [{ kind: "word", node: <Placeholder raw={segment.raw} note={segment.note} /> }];
    }
    return segment.value
      .split(/(\s+)/)
      .filter((part) => part !== "")
      .map((part): Unit =>
        /^\s+$/.test(part) ? { kind: "space", value: part } : { kind: "word", node: part },
      );
  });

  // Each word's place among the words, for its delay; spaces do not count.
  const order = units.map(
    (_, index) => units.slice(0, index).filter((unit) => unit.kind === "word").length,
  );

  return (
    <>
      {units.map((unit, index) => {
        if (unit.kind === "space") return <span key={index}>{unit.value}</span>;
        const style = { "--rise-delay": `${delay + order[index] * step}ms` } as CSSProperties;
        return (
          <span
            key={index}
            className="inline-block overflow-hidden align-baseline [margin:-0.12em_0_-0.16em] [padding:0.12em_0_0.16em]"
          >
            <span data-rise="" style={style}>
              {unit.node}
            </span>
          </span>
        );
      })}
    </>
  );
}
