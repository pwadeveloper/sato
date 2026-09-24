/**
 * `{{CONFIRM: ...}}` placeholders.
 *
 * Unconfirmed copy is authored inline in `/content` as `{{CONFIRM: note}}`
 * (or a bare `{{CONFIRM}}`). Development renders these highlighted so they are
 * impossible to miss; a later production-build check fails while any remain.
 */

/** Source of the placeholder pattern. A fresh RegExp is built per call so the
 *  global `lastIndex` is never shared between callers. */
const CONFIRM_SOURCE = String.raw`\{\{CONFIRM(?::\s*([\s\S]*?))?\}\}`;

export interface TextSegment {
  kind: "text";
  value: string;
}

export interface PlaceholderSegment {
  kind: "placeholder";
  /** The placeholder exactly as authored, e.g. `{{CONFIRM: RC number}}`. */
  raw: string;
  /** The note inside the placeholder, or `""` for a bare `{{CONFIRM}}`. */
  note: string;
}

export type Segment = TextSegment | PlaceholderSegment;

/** Splits text into literal runs and placeholders, in document order. */
export function parseConfirmable(text: string): Segment[] {
  const pattern = new RegExp(CONFIRM_SOURCE, "g");
  const segments: Segment[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      segments.push({ kind: "text", value: text.slice(cursor, match.index) });
    }
    segments.push({
      kind: "placeholder",
      raw: match[0],
      note: (match[1] ?? "").trim(),
    });
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    segments.push({ kind: "text", value: text.slice(cursor) });
  }

  return segments;
}

/** True if the text still contains an unresolved placeholder. */
export function hasPlaceholder(text: string): boolean {
  return new RegExp(CONFIRM_SOURCE).test(text);
}
