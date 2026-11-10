import { Counter } from "./motion/Counter";
import { RichText } from "./RichText";
import type { CompanyFact } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface DataPlateProps {
  facts: CompanyFact[];
  heading: string;
  headingId: string;
  className?: string;
}

/** Facts whose value is a whole number are counted up as they come into view. */
const isFigure = (value: string) => /^\d{1,4}$/.test(value.trim());

/**
 * The company's facts as a plate: label, value, note.
 *
 * It reads from `getCompanyFacts()`, so a row appears only when there is
 * something confirmed to put in it, and the registration number stays out
 * while `showRcNumber` is off. A figure counts up; everything else is just
 * set. The first cell is the registered name, in the display face, because
 * for the visitor this page is written for it is the fact that matters.
 */
export function DataPlate({ facts, heading, headingId, className }: DataPlateProps) {
  return (
    <section aria-labelledby={headingId} className={cn(className)}>
      <h2 id={headingId} className="sr-only">
        <RichText text={heading} />
      </h2>
      {/* One reveal for the whole plate: cells fading in one by one over the
          hairline grid would show the grid as a grey block first. */}
      <dl
        data-reveal=""
        className="grid gap-px border border-rule-dark bg-rule-dark sm:grid-cols-2 lg:grid-cols-4"
      >
        {facts.map((fact, index) => {
          const figure = isFigure(fact.value);
          const lead = index === 0;
          return (
            <div
              key={fact.id}
              className={cn(
                "flex min-h-44 flex-col justify-between bg-asphalt p-6 md:p-7",
                lead && "sm:col-span-2 lg:col-span-4",
              )}
            >
              <dt className="eyebrow text-steel-light">
                <RichText text={fact.label} />
              </dt>
              <dd className="mt-6">
                <span
                  className={cn(
                    "block text-concrete",
                    figure ? "text-5xl font-black tabular wdth-display md:text-6xl" : lead ? "text-h2 wdth-heading" : "text-lg font-medium wdth-body",
                  )}
                >
                  {figure ? <Counter value={Number(fact.value)} /> : <RichText text={fact.value} />}
                </span>
                {fact.note ? (
                  <span className="eyebrow mt-3 block text-brand-light">
                    <RichText text={fact.note} />
                  </span>
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
