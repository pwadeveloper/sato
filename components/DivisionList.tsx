import Link from "next/link";
import { RichText } from "./RichText";
import type { Service } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface DivisionListProps {
  services: Service[];
  headingLevel?: 2 | 3;
  className?: string;
}

/**
 * The four divisions as a ruled register, not a row of cards.
 *
 * Cards would set four boxes competing with the data plate; rows read as a
 * schedule, which is the page's voice. A 64px laterite lead-in marks the top
 * edge — the section's only colour — and the rest is hairline.
 */
export function DivisionList({
  services,
  headingLevel = 3,
  className,
}: DivisionListProps) {
  const Name = `h${headingLevel}` as const;

  return (
    <ul className={cn("relative border-t border-rule", className)}>
      <span
        aria-hidden="true"
        className="absolute -top-px left-0 h-px w-16 bg-laterite"
      />

      {services.map((service) => (
        <li key={service.slug} className="border-b border-rule">
          <Link
            href={`/services/${service.slug}`}
            className="
              group -mx-4 grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-2 px-4 py-6
              no-underline transition-colors duration-150 hover:bg-white
              md:py-8 lg:grid-cols-[5fr_6fr_auto] lg:gap-x-10
            "
          >
            <Name className="text-h3 wdth-heading text-balance text-asphalt">
              <RichText text={service.name} />
            </Name>

            <span
              aria-hidden="true"
              className="
                row-span-2 self-center text-xl leading-none text-steel
                transition-colors duration-150 group-hover:text-laterite
                lg:row-span-1 lg:self-baseline
              "
            >
              &rarr;
            </span>

            <p
              className="
                col-start-1 text-base text-steel-ink wdth-body
                lg:col-start-2 lg:row-start-1
              "
            >
              <RichText text={service.shortSummary} />
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
