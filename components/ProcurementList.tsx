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
        <RichText text={block.heading} />
      </HeadingTag>

      <p className="mt-3 max-w-(--container-measure) text-base text-steel-ink wdth-body">
        <RichText text={block.intro} />
      </p>

      <dl className="mt-6 border-t border-asphalt">
        {block.categories.map((category) => (
          <div key={category.id} className="border-b border-rule py-4 md:flex md:gap-8">
            <dt className="text-base font-bold wdth-body md:w-56 md:shrink-0">
              <RichText text={category.label} />
            </dt>
            <dd className="mt-1 md:mt-0">
              <ul className="flex flex-col gap-1">
                {category.brands.map((brand) => (
                  <li key={brand} className="text-sm text-steel-ink wdth-body">
                    <RichText text={brand} />
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>

      {block.note ? (
        <p className="mt-4 max-w-(--container-measure) text-xs text-steel-ink wdth-body">
          <RichText text={block.note} />
        </p>
      ) : null}
    </div>
  );
}
