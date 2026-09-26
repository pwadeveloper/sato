import { Fragment } from "react";
import { parseConfirmable } from "@/lib/placeholders";
import { showPlaceholders } from "@/lib/review-mode";

/** Tags `RichText` is allowed to render into. */
type TextTag =
  | "span"
  | "p"
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "li"
  | "dt"
  | "dd"
  | "strong"
  | "figcaption";

/**
 * An unresolved `{{CONFIRM: ...}}` placeholder.
 *
 * Highlighted in development and on a review deployment, with the note as a
 * tooltip. In a real production build it renders the raw text, so anything
 * that slips through is still literal and greppable rather than silently
 * blank — but the placeholder gate means nothing should get that far.
 */
export function Placeholder({ raw, note }: { raw: string; note: string }) {
  if (!showPlaceholders) {
    return <>{raw}</>;
  }

  return (
    <mark
      data-placeholder=""
      title={note || raw}
      className="rounded-sm bg-yellow-200 px-1 text-yellow-950 outline-2 outline-offset-2 outline-yellow-600 outline-dashed"
    >
      {raw}
    </mark>
  );
}

export interface RichTextProps {
  text: string;
  /** Defaults to `span`, so `RichText` is safe to nest inside other copy. */
  as?: TextTag;
  className?: string;
}

/** Renders a single content string, highlighting any placeholders it contains. */
export function RichText({ text, as: Tag = "span", className }: RichTextProps) {
  const segments = parseConfirmable(text);

  return (
    <Tag className={className}>
      {segments.map((segment, index) =>
        segment.kind === "text" ? (
          <Fragment key={index}>{segment.value}</Fragment>
        ) : (
          <Placeholder key={index} raw={segment.raw} note={segment.note} />
        ),
      )}
    </Tag>
  );
}
