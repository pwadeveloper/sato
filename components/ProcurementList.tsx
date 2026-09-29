import { Heading } from "./Heading";
import { RichText } from "./RichText";
import type { ProcurementBlock } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ProcurementListProps {
  block: ProcurementBlock;
  headingId: string;
  headingLevel?: 2 | 3;
  className?: string;
}

/**
 * Equipment categories, with the makes offered set quieter beneath each.
 *
 * The category is the claim — Sato sources this class of equipment. The
 * manufacturer names are supporting detail and are typeset as such, because
 * a list of brands in the same weight as the heading reads as a claim of
 * appointment that has not been confirmed.
 */
export function ProcurementList({
  block,
  headingId,
  headingLevel = 2,
  className,
}: ProcurementListProps) {


  return (
    <div className={cn(className)}>
      <Heading
        level={headingLevel}
        size={headingLevel === 2 ? "h2" : "h3"}
        text={block.heading}
        id={headingId}
      />

      <p className="mt-3 max-w-(--container-measure) text-base text-steel-ink wdth-body">
        <RichText text={block.intro} />
      </p>

      {/*
        Sections with real `h4` headings rather than a `<dl>`. The categories
        are groups inside this block's `h3`, which is what an `h4` is for on a
        service page, and heading content is not allowed inside a `<dt>`.
      */}
      <div className="mt-6 border-t border-asphalt">
        {block.categories.map((category) => (
          <section
            key={category.id}
            aria-labelledby={`${headingId}-${category.id}`}
            className="border-b border-rule py-4 md:flex md:gap-8"
          >
            <Heading
              level={4}
              size="h4"
              text={category.label}
              id={`${headingId}-${category.id}`}
              className="md:w-56 md:shrink-0"
            />
            <ul className="mt-2 flex flex-col gap-1 md:mt-0">
              {category.brands.map((brand) => (
                <li key={brand} className="text-sm text-steel-ink wdth-body">
                  <RichText text={brand} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {block.note ? (
        <p className="mt-4 max-w-(--container-measure) text-xs text-steel-ink wdth-body">
          <RichText text={block.note} />
        </p>
      ) : null}
    </div>
  );
}
