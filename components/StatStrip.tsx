import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

export interface StatStripGroup {
  id: string;
  /** Whose figures these are — "Sato", "Our consortium". Always printed. */
  label: string;
  stats: Array<{ id?: string; value: string | number; label: string }>;
}

export interface StatStripProps {
  groups: StatStripGroup[];
  className?: string;
}

/**
 * Headline figures in labelled groups.
 *
 * The label is the point. Sato's own figures and the consortium's sit side by
 * side on Home, and a reader must never be able to read 160 upstream projects
 * as Sato's own record or 1997 as the start of the oil and gas work. So every
 * group carries its owner's name above its numbers, and the groups are
 * separated by a rule rather than run together in one row.
 */
export function StatStrip({ groups, className }: StatStripProps) {
  return (
    <div
      className={cn(
        "grid gap-10",
        groups.length > 1 && "lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-0",
        className,
      )}
    >
      {groups.map((group, groupIndex) => (
        <section
          key={group.id}
          aria-label={group.label}
          className={cn(
            groupIndex > 0 && groups.length > 1 && "lg:border-l lg:border-rule lg:pl-10",
            groupIndex === 0 && groups.length > 1 && "lg:pr-10",
          )}
        >
          <p className="eyebrow text-xs! flex items-center gap-2 text-steel-ink">
            <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-brand" />
            <RichText text={group.label} />
          </p>
          <dl
            className={cn(
              "mt-4 grid gap-x-8 gap-y-6",
              group.stats.length > 2 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2",
            )}
          >
            {group.stats.map((stat) => (
              <div key={stat.id ?? stat.label} className="flex flex-col border-t border-asphalt pt-3">
                <dt className="order-2 mt-2 text-sm leading-snug text-steel-ink wdth-body text-pretty">
                  <RichText text={stat.label} />
                </dt>
                <dd className="order-1 font-display text-4xl leading-none tracking-[-0.02em] text-asphalt tabular md:text-5xl">
                  {typeof stat.value === "number" ? stat.value : <RichText text={stat.value} />}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
