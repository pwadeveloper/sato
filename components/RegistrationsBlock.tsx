import { RichText } from "./RichText";
import { hasPlaceholder } from "@/lib/placeholders";
import { cn } from "@/lib/cn";

export interface RegistrationsBlockProps {
  heading: string;
  items: string[];
  headingId?: string;
  headingLevel?: 2 | 3;
  className?: string;
}

const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * Registrations and permits — the block a vendor-verification team looks for.
 *
 * In development every item renders, so unconfirmed entries stay visible and
 * chaseable. In production only confirmed items render, and the whole block is
 * withheld if none are confirmed: an empty "Registrations" heading on a page
 * aimed at oil and gas procurement is worse than no heading at all.
 */
export function RegistrationsBlock({
  heading,
  items,
  headingId,
  headingLevel = 2,
  className,
}: RegistrationsBlockProps) {
  const confirmed = items.filter((item) => !hasPlaceholder(item));
  const visible = isDevelopment ? items : confirmed;

  if (!visible.length) return null;

  const HeadingTag = `h${headingLevel}` as const;

  return (
    <div className={cn("border border-rule bg-white p-6 md:p-8", className)}>
      <HeadingTag
        id={headingId}
        className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body"
      >
        <RichText text={heading} />
      </HeadingTag>

      <ul className="mt-4 border-t border-asphalt">
        {visible.map((item) => (
          <li key={item} className="border-b border-rule py-3 text-base wdth-body">
            <RichText text={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
