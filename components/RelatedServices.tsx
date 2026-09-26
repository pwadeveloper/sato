import Link from "next/link";
import { RichText } from "./RichText";
import type { Service } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface RelatedServicesProps {
  heading: string;
  headingId: string;
  services: Service[];
  className?: string;
}

/**
 * Sideways links between services that are delivered together.
 *
 * Much of the oil and gas offer is digital, so that page points at
 * Digitalization & Digital Twin rather than describing it twice.
 */
export function RelatedServices({
  heading,
  headingId,
  services,
  className,
}: RelatedServicesProps) {
  return (
    <div className={cn(className)}>
      <h2
        id={headingId}
        className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body"
      >
        <RichText text={heading} />
      </h2>

      {/* The hairline grid is drawn by the gap, so an odd item in a
          two-column track would leave an empty grey cell. */}
      <ul
        className={cn(
          "mt-4 grid gap-px border border-rule bg-rule",
          services.length > 1 && "md:grid-cols-2",
        )}
      >
        {services.map((service) => (
          <li key={service.slug} className="relative bg-white p-5">
            <h3 className="text-base font-bold wdth-heading">
              <Link
                href={`/services/${service.slug}`}
                className="no-underline after:absolute after:inset-0 after:content-['']"
              >
                <RichText text={service.name} />
              </Link>
            </h3>
            <p className="mt-1 text-sm text-steel-ink wdth-body">
              <RichText text={service.shortSummary} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
