import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

export interface CapabilityListProps {
  items: string[];
  heading?: string;
  headingId?: string;
  headingLevel?: 2 | 3;
  className?: string;
}

/** Hairline-separated schedule. Used as the service page's sidebar. */
export function CapabilityList({
  items,
  heading,
  headingId,
  headingLevel = 2,
  className,
}: CapabilityListProps) {
  const HeadingTag = `h${headingLevel}` as const;

  return (
    <div className={cn(className)}>
      {heading ? (
        <HeadingTag
          id={headingId}
          className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body"
        >
          <RichText text={heading} />
        </HeadingTag>
      ) : null}

      <ul className="mt-4 border-t border-asphalt">
        {items.map((item) => (
          <li key={item} className="border-b border-rule py-3 text-base wdth-body">
            <RichText text={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
