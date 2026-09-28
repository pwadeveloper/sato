import { RichText } from "./RichText";
import type { ServiceList, ServiceListItem } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ServiceListBlockProps {
  list: ServiceList;
  headingId: string;
  headingLevel?: 2 | 3;
  /** `dense` sets the items in columns — for long lists of short phrases. */
  variant?: "dense" | "plain";
  className?: string;
}

/** One row: the name, and its description underneath where it has one. */
function Item({ item, dense }: { item: ServiceListItem; dense: boolean }) {
  return (
    <li
      className={cn(
        "border-b border-rule py-2.5 wdth-body",
        dense && "break-inside-avoid",
      )}
    >
      <span className="block text-base">
        <RichText text={item.name} />
      </span>
      {item.description ? (
        <span className="mt-1 block text-sm text-steel-ink text-pretty">
          <RichText text={item.description} />
        </span>
      ) : null}
    </li>
  );
}

/**
 * A heading over a list of named solutions or scope items.
 *
 * Two shapes. A flat list is what most services need: bare phrases, set in
 * two columns when they are short. A grouped list is for one that has grown
 * past scanning — subheadings, and a description under any item whose name
 * does not carry its own meaning. Groups are not columns within themselves:
 * a description under a phrase in a 50%-width column wraps to four lines and
 * stops being scannable, which is the thing the grouping was for.
 */
export function ServiceListBlock({
  list,
  headingId,
  headingLevel = 2,
  variant = "plain",
  className,
}: ServiceListBlockProps) {
  const HeadingTag = `h${headingLevel}` as const;
  const groups = list.groups ?? [];
  const dense = variant === "dense";

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

      {groups.length ? (
        // Columns rather than a grid: the groups are different lengths, and a
        // two-column grid holds every cell in a row to the tallest one, which
        // leaves a block of white under the short group. Columns flow and
        // balance instead.
        <div className="mt-6 md:columns-2 md:gap-x-10">
          {groups.map((group) => (
            <section
              key={group.id}
              aria-labelledby={`${headingId}-${group.id}`}
              className="mb-8 break-inside-avoid last:mb-0"
            >
              <h4
                id={`${headingId}-${group.id}`}
                className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body"
              >
                <RichText text={group.heading} />
              </h4>
              <ul className="mt-3 border-t border-asphalt">
                {group.items.map((item) => (
                  <Item key={item.name} item={item} dense={false} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul
          className={cn(
            "mt-5 border-t border-asphalt",
            dense && "sm:columns-2 sm:gap-x-10",
          )}
        >
          {list.items.map((item) => (
            <Item key={item} item={{ name: item }} dense={dense} />
          ))}
        </ul>
      )}
    </div>
  );
}
