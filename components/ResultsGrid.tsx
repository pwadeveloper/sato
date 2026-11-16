import { Heading } from "./Heading";
import { RichText } from "./RichText";
import type { ResultItem } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ResultsGridGroup {
  id: string;
  heading?: string;
  items: ResultItem[];
}

export interface ResultsGridProps {
  heading: string;
  intro?: string;
  groups: ResultsGridGroup[];
  headingId: string;
  headingLevel?: 2 | 3;
  className?: string;
}

/**
 * Results, each with the papers it is published in.
 *
 * The references are the credibility, so they are always printed with the
 * result, in the mono, small, under it — never dropped to fit. Where a result
 * has a headline number it is set large above the sentence, and the sentence
 * itself is printed in full, verbatim, so the number is never read out of the
 * context the paper gives it.
 *
 * Used on the Oil & Gas service page (the full list) and on
 * `/projects/oil-gas` ("Results at a glance"), from the same records.
 */
export function ResultsGrid({
  heading,
  intro,
  groups,
  headingId,
  headingLevel = 3,
  className,
}: ResultsGridProps) {
  return (
    <div className={cn(className)}>
      <Heading
        level={headingLevel}
        size={headingLevel === 2 ? "h2" : "h3"}
        text={heading}
        id={headingId}
      />

      {intro ? (
        <p className="mt-3 max-w-(--container-measure) text-base text-steel-ink wdth-body">
          <RichText text={intro} />
        </p>
      ) : null}

      {groups.map((group) => (
        <section
          key={group.id}
          aria-labelledby={group.heading ? `${headingId}-${group.id}` : undefined}
          className="mt-8"
        >
          {group.heading ? (
            <Heading
              level={headingLevel === 2 ? 3 : 4}
              size="h4"
              text={group.heading}
              id={`${headingId}-${group.id}`}
            />
          ) : null}

          <ul className="mt-4 grid border-t border-l border-rule sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item, index) => (
              <li
                key={item.id}
                className="flex flex-col border-r border-b border-rule bg-paper p-5"
                data-anim="fade"
                data-delay={index * 60}
              >
                {item.value ? (
                  <p
                    aria-hidden="true"
                    className="font-display text-4xl leading-none tracking-[-0.02em] text-brand-ink tabular"
                  >
                    <RichText text={item.value} />
                  </p>
                ) : null}
                <p className={cn("text-base leading-snug wdth-body text-pretty", item.value && "mt-3")}>
                  <RichText text={item.label} />
                </p>
                {item.refs ? (
                  <p className="eyebrow mt-auto pt-4 text-xs! text-steel-ink">
                    <RichText text={item.refs} />
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
