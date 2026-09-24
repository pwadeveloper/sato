import Image from "next/image";
import { RichText } from "./RichText";
import { isKnown } from "@/lib/placeholders";
import type { CollectionFacet, Equipment } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface EquipmentScheduleProps {
  items: Equipment[];
  groups: CollectionFacet[];
  quantityLabel: string;
  locationLabel: string;
  headingLevel?: 2 | 3;
  className?: string;
}

/**
 * The plant register, grouped by category.
 *
 * Items with a photograph lead their group as cards; the rest follow as a
 * dense ruled list. A 49-line schedule is a document a procurement reader
 * scans, so quantities are tabular and the whole thing stays scannable rather
 * than becoming 49 identical image cards.
 */
/**
 * Quantity and yard, omitting whichever is still unconfirmed.
 *
 * This is a register a procurement reader scans, so a line reading
 * "Qty {{CONFIRM: quantity}}" is worse than a line with no quantity at all.
 */
function ItemMeta({
  item,
  quantityLabel,
  locationLabel,
  className,
}: {
  item: Equipment;
  quantityLabel: string;
  locationLabel: string;
  className?: string;
}) {
  const hasQuantity = isKnown(item.quantity);
  const hasLocation = isKnown(item.location);

  if (!hasQuantity && !hasLocation) return null;

  return (
    <span className={cn("text-xs text-steel-ink tabular wdth-body", className)}>
      {hasQuantity ? (
        <>
          <RichText text={quantityLabel} /> <RichText text={item.quantity ?? ""} />
        </>
      ) : null}

      {hasQuantity && hasLocation ? (
        <span aria-hidden="true" className="px-2 text-steel">
          ·
        </span>
      ) : null}

      {hasLocation ? (
        <>
          <span className="sr-only">
            <RichText text={locationLabel} />{" "}
          </span>
          <RichText text={item.location ?? ""} />
        </>
      ) : null}
    </span>
  );
}

export function EquipmentSchedule({
  items,
  groups,
  quantityLabel,
  locationLabel,
  headingLevel = 2,
  className,
}: EquipmentScheduleProps) {
  const GroupHeading = `h${headingLevel}` as const;

  return (
    <div className={cn("flex flex-col gap-14", className)}>
      {groups.map((group) => {
        const members = items.filter((item) => item.category === group.value);
        if (!members.length) return null;

        const withImage = members.filter((item) => item.image);
        const withoutImage = members.filter((item) => !item.image);

        return (
          <section key={group.value}>
            <GroupHeading className="text-h3 wdth-heading">
              <RichText text={group.label} />
            </GroupHeading>

            {withImage.length ? (
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {withImage.map((item) => (
                  <li key={item.slug} className="border border-rule bg-white">
                    <div className="relative aspect-3/2 w-full overflow-hidden bg-steel/10">
                      {item.image ? (
                        <Image
                          src={item.image.src}
                          alt={item.image.alt}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="p-5">
                      <p className="text-base font-bold wdth-heading">
                        <RichText text={item.name} />
                      </p>
                      {item.notes ? (
                        <p className="mt-1 text-sm text-steel-ink wdth-body">
                          <RichText text={item.notes} />
                        </p>
                      ) : null}
                      <ItemMeta
                        item={item}
                        quantityLabel={quantityLabel}
                        locationLabel={locationLabel}
                        className="mt-3 block"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            {withoutImage.length ? (
              <ul className={cn("border-t border-asphalt", withImage.length ? "mt-8" : "mt-6")}>
                {withoutImage.map((item) => (
                  <li
                    key={item.slug}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule py-3"
                  >
                    <span className="text-base wdth-body">
                      <RichText text={item.name} />
                      {item.notes ? (
                        <span className="ml-2 text-sm text-steel-ink">
                          <RichText text={item.notes} />
                        </span>
                      ) : null}
                    </span>

                    <ItemMeta
                      item={item}
                      quantityLabel={quantityLabel}
                      locationLabel={locationLabel}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
