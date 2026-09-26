import Link from "next/link";
import { RichText } from "./RichText";
import type { Service, ServiceGroup } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ServiceGroupListProps {
  bands: Array<{ group: ServiceGroup; services: Service[] }>;
  /** Band headings and one-line intros, keyed `groupEngineering` etc. */
  labels: Record<string, string>;
  headingLevel?: 2 | 3;
  className?: string;
}

const key = (group: string) =>
  `group${group[0].toUpperCase()}${group.slice(1)}`;

/**
 * The three bands, each listing its divisions as links.
 *
 * Eight equal cards would say all eight are the same size of thing, which is
 * not true — four are disciplines Sato has delivered with since 1997 and four
 * are newer. Grouping them carries that without ranking them on the page.
 */
export function ServiceGroupList({
  bands,
  labels,
  headingLevel = 3,
  className,
}: ServiceGroupListProps) {
  const BandHeading = `h${headingLevel}` as const;

  return (
    <div className={cn("grid gap-10 md:grid-cols-3 md:gap-8", className)}>
      {bands.map((band) => (
        <section key={band.group} aria-labelledby={`home-band-${band.group}`}>
          <div className="border-t-[3px] border-brand pt-4">
            <BandHeading
              id={`home-band-${band.group}`}
              className="text-2xs font-semibold uppercase tracking-[0.08em] text-brand-deep wdth-body"
            >
              <RichText text={labels[key(band.group)] ?? band.group} />
            </BandHeading>
          </div>

          <ul className="mt-4">
            {band.services.map((service) => (
              <li key={service.slug} className="border-b border-rule">
                <Link
                  href={`/services/${service.slug}`}
                  className="
                    group -mx-3 flex items-baseline justify-between gap-4 px-3 py-4
                    no-underline transition-colors duration-150 hover:bg-white
                  "
                >
                  <span className="text-base font-medium text-asphalt wdth-body text-balance">
                    <RichText text={service.name} />
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-base leading-none text-steel transition-colors duration-150 group-hover:text-brand-deep"
                  >
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
