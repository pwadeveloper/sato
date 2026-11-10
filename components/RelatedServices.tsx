import Link from "next/link";
import { Heading } from "./Heading";
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
      {/* An `h3`: this sits inside the Partnerships section, under that
          section's `h2`, like every other subsection on a service page. */}
      <Heading level={3} size="h3" text={heading} id={headingId} />

      {/* The hairline grid is drawn by the gap, so an odd item in a
          two-column track would leave an empty grey cell. */}
      <ul
        className={cn(
          "mt-5 grid gap-px border border-rule bg-rule",
          services.length > 1 && "md:grid-cols-2",
        )}
      >
        {services.map((service, index) => (
          <li key={service.slug} className="group relative bg-paper p-6">
            <span aria-hidden="true" className="eyebrow tabular text-steel">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h4 className="mt-2 flex items-baseline gap-3 text-base font-bold wdth-heading">
              <Link
                href={`/services/${service.slug}`}
                className="no-underline after:absolute after:inset-0 after:content-['']"
              >
                <RichText text={service.name} />
              </Link>
              <span
                aria-hidden="true"
                className="inline-block text-[0.8em] text-brand transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-1 motion-reduce:transition-none"
              >
                &rarr;
              </span>
            </h4>
            <p className="mt-1 text-sm text-steel-ink wdth-body">
              <RichText text={service.shortSummary} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
