import Link from "next/link";
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
      <h2 id={headingId} className="text-h2 wdth-heading text-balance">
        <RichText text={heading} />
      </h2>

      {intro ? (
        <p className="mt-3 max-w-(--container-measure) text-lg text-steel-ink wdth-body">
          <RichText text={intro} />
        </p>
      ) : null}

      <ul className="mt-8 grid gap-px border border-rule bg-rule md:grid-cols-2">
        {items.map((item) => (
          <li key={item.href} className="relative bg-white p-6 md:p-8">
            <h3 className="text-xl font-bold wdth-heading">
              <Link
                href={item.href}
                className="no-underline after:absolute after:inset-0 after:content-['']"
              >
                <RichText text={item.label} />
              </Link>
            </h3>
            <p className="mt-2 text-base text-steel-ink wdth-body">
              <RichText text={item.body} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
