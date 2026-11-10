import Link from "next/link";
import { Reveal } from "./Reveal";
import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

export interface BackedByItem {
  label: string;
  body: string;
  href: string;
}

export interface BackedByStripProps {
  heading: string;
  intro?: string;
  items: BackedByItem[];
  headingId?: string;
  className?: string;
}

/**
 * Shared capability that applies to every service — plant fleet, delivered
 * projects, long-standing clients. Rendered on each service page so a reader
 * who lands directly on one service still sees what stands behind it.
 */
export function BackedByStrip({
  heading,
  intro,
  items,
  headingId,
  className,
}: BackedByStripProps) {
  return (
    <div className={cn(className)}>
      <Reveal>
        <h2 id={headingId} className="text-h2 wdth-heading text-balance">
          <RichText text={heading} />
        </h2>

        {intro ? (
          <p className="mt-3 max-w-(--container-measure) text-lg text-steel-ink wdth-body text-pretty">
            <RichText text={intro} />
          </p>
        ) : null}
      </Reveal>

      <ul className={cn("mt-8 grid gap-px border border-rule bg-rule", items.length > 1 && "md:grid-cols-2")}>
        {items.map((item, index) => (
          <Reveal key={item.href} as="li" index={index} className="group relative bg-paper p-6 md:p-8">
            <span aria-hidden="true" className="eyebrow tabular text-steel">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 flex items-baseline gap-3 text-xl font-bold wdth-heading">
              <Link
                href={item.href}
                className="no-underline after:absolute after:inset-0 after:content-['']"
              >
                <RichText text={item.label} />
              </Link>
              <span
                aria-hidden="true"
                className="inline-block text-[0.7em] text-brand transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-1 motion-reduce:transition-none"
              >
                &rarr;
              </span>
            </h3>
            <p className="mt-2 text-base text-steel-ink wdth-body text-pretty">
              <RichText text={item.body} />
            </p>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
