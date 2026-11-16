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
  /** `h3` when the strip sits inside a section, as on Oil & Gas. */
  headingLevel?: 2 | 3;
  className?: string;
}

/**
 * Shared capability that applies to every service — plant fleet, delivered
 * projects, long-standing clients. Rendered on each service page so a reader
 * who lands directly on one service still sees what stands behind it.
 *
 * A service may replace it with its own version (`backed-by-<slug>` in
 * `pages/services.json`): Oil & Gas has "One group, two strengths", because
 * "Backed by Sato" read there as two companies, and it renders inside the
 * Partnerships section as an `h3`.
 */
export function BackedByStrip({
  heading,
  intro,
  items,
  headingId,
  headingLevel = 2,
  className,
}: BackedByStripProps) {
  const HeadingTag = headingLevel === 2 ? "h2" : "h3";
  const CardTag = headingLevel === 2 ? "h3" : "h4";
  return (
    <div className={cn(className)}>
      <HeadingTag
        id={headingId}
        className={cn(headingLevel === 2 ? "text-h2" : "text-h3", "wdth-heading text-balance")}
      >
        <RichText text={heading} />
      </HeadingTag>

      {intro ? (
        <p className="mt-3 max-w-(--container-measure) text-lg text-steel-ink wdth-body">
          <RichText text={intro} />
        </p>
      ) : null}

      <ul className={cn("mt-8 grid gap-px border border-rule bg-rule", items.length > 1 && "md:grid-cols-2")}>
        {items.map((item) => (
          <li key={item.href} className="relative bg-white p-6 md:p-8">
            <CardTag className="text-xl font-bold wdth-heading">
              <Link
                href={item.href}
                className="no-underline after:absolute after:inset-0 after:content-['']"
              >
                <RichText text={item.label} />
              </Link>
            </CardTag>
            <p className="mt-2 text-base text-steel-ink wdth-body">
              <RichText text={item.body} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
