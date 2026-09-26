import { RichText } from "./RichText";
import type { ServiceList } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ServiceListBlockProps {
  list: ServiceList;
  headingId: string;
  headingLevel?: 2 | 3;
  /** `dense` sets the items in columns — for long lists of short phrases. */
  variant?: "dense" | "plain";
  className?: string;
}

/** A heading over a list of named solutions or scope items. */
export function ServiceListBlock({
  list,
  headingId,
  headingLevel = 2,
  variant = "plain",
  className,
}: ServiceListBlockProps) {
  const HeadingTag = `h${headingLevel}` as const;

  return (
    <div className={cn(className)}>
      <HeadingTag
        id={headingId}
        className={
          headingLevel === 2
            ? "text-h3 wdth-heading text-balance"
            : "text-xl font-bold wdth-heading text-balance"
        }
      >
        <RichText text={list.heading} />
      </HeadingTag>

      {list.intro ? (
        <p className="mt-3 max-w-(--container-measure) text-base text-steel-ink wdth-body">
          <RichText text={list.intro} />
        </p>
      ) : null}

      <ul
        className={cn(
          "mt-5 border-t border-asphalt",
          variant === "dense" && "sm:columns-2 sm:gap-x-10",
        )}
      >
        {list.items.map((item) => (
          <li
            key={item}
            className={cn(
              "border-b border-rule py-2.5 text-base wdth-body",
              variant === "dense" && "break-inside-avoid",
            )}
          >
            <RichText text={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
