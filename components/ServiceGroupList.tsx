import Link from "next/link";
import { RichText } from "./RichText";
import type { ServiceBand } from "@/lib/content-types";
import { bandHref, bandItems } from "@/lib/service-band";
import { cn } from "@/lib/cn";

export interface ServiceGroupListProps {
  bands: ServiceBand[];
  headingLevel?: 2 | 3;
  className?: string;
}

/**
 * The service categories, each listing the services inside it.
 *
 * Eight equal cards would say all eight are the same size of thing, which is
 * not true — four are disciplines Sato has delivered with since 1997 and the
 * rest are newer. Grouping carries that without ranking them on the page.
 *
 * A category holding a single service collapses into one link and shows that
 * service's one-liner instead of a list, so Energy Services never appears as
 * a heading over a list whose only entry repeats it.
 */
export function ServiceGroupList({
  bands,
  headingLevel = 3,
  className,
}: ServiceGroupListProps) {
  const BandHeading = `h${headingLevel}` as const;
  const headingClass =
    "text-2xs font-semibold uppercase tracking-[0.08em] text-brand-deep wdth-body";

  return (
    <div className={cn("grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8", className)}>
      {bands.map((band) => {
        const categoryHref = bandHref(band);
        const items = bandItems(band);
        const solo = items.length === 0 ? band.services[0] : undefined;

        return (
          <section key={band.group} aria-labelledby={`home-band-${band.group}`}>
            <div className="border-t-[3px] border-brand-bright pt-4">
              <BandHeading id={`home-band-${band.group}`} className={headingClass}>
                {categoryHref ? (
                  <Link
                    href={categoryHref}
                    className="no-underline transition-colors duration-150 hover:text-brand-ink"
                  >
                    <RichText text={band.label} />
                  </Link>
                ) : (
                  <RichText text={band.label} />
                )}
              </BandHeading>
            </div>

            {solo ? (
              /* The category is one service, so the row carries the link and
                 the heading above it stays plain — the affordance matches the
                 multi-service cards without duplicating their destination. */
              <div className="mt-4 border-b border-rule">
                <Link
                  href={`/services/${solo.slug}`}
                  className="
                    group -mx-3 flex items-start justify-between gap-4 px-3 py-4
                    no-underline transition-colors duration-150 hover:bg-white
                  "
                >
                  <span className="text-base text-steel-ink wdth-body text-pretty">
                    {/* The row's visible text is the summary, so the link
                        says where it goes to a screen reader too. */}
                    <span className="sr-only">
                      <RichText text={solo.name} />
                      {" — "}
                    </span>
                    <RichText text={solo.shortSummary} />
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-base leading-none text-steel transition-colors duration-150 group-hover:text-brand"
                  >
                    &rarr;
                  </span>
                </Link>
              </div>
            ) : (
              <ul className="mt-4">
                {items.map((service) => (
                  <li key={service.slug} className="border-b border-rule">
                    <Link
                      href={`/services/${service.slug}`}
                      className="
                        group -mx-3 flex items-baseline justify-between gap-4 px-3 py-4
                        no-underline transition-colors duration-150 hover:bg-white
                      "
                    >
                      <span className="text-base font-semibold text-asphalt wdth-body text-balance">
                        <RichText text={service.name} />
                      </span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-base leading-none text-steel transition-colors duration-150 group-hover:text-brand"
                      >
                        &rarr;
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
