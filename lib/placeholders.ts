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

/**
 * True when the text says something once its placeholders are taken out.
 *
 * `"2012"` is known; `"{{CONFIRM: year}}"` is not; `"2012 {{CONFIRM: month}}"`
 * is, and renders with the placeholder still highlighted. Fields that are only
 * a placeholder are omitted from project meta rather than printed, so a card
 * shows what is established and nothing else.
 */
export function isKnown(text: string | undefined | null): boolean {
  if (!text) return false;
  return text.replace(new RegExp(CONFIRM_SOURCE, "g"), "").trim().length > 0;
}

/**
 * The text with every placeholder removed and whitespace tidied.
 *
 * For anything that leaves the page as data rather than as reading copy — a
 * `<title>`, a meta description, an Open Graph card — where a raw
 * `{{CONFIRM: ...}}` would be published to a search result or a shared link.
 */
export function stripPlaceholders(text: string): string {
  return text
    .replace(new RegExp(CONFIRM_SOURCE, "g"), "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();
}
