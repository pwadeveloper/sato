import { Reveal } from "./Reveal";
import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

export interface CapabilityListProps {
  items: string[];
  heading?: string;
  headingId?: string;
  headingLevel?: 2 | 3;
  className?: string;
}

/** Hairline-separated schedule, each line indexed. Used as a scope list. */
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
        <HeadingTag id={headingId} className="eyebrow text-steel-ink">
          <RichText text={heading} />
        </HeadingTag>
      ) : null}

      <ol className="mt-4 border-t border-asphalt">
        {items.map((item, index) => (
          <Reveal
            key={item}
            as="li"
            index={index}
            className="flex items-baseline gap-4 border-b border-rule py-3 text-base wdth-body"
          >
            <span aria-hidden="true" className="eyebrow tabular text-steel">
              {String(index + 1).padStart(2, "0")}
            </span>
            <RichText text={item} />
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
