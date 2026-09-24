import { Heading } from "./Heading";
import { RichText } from "./RichText";
import type { CompanyFact } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface CompanyFactsPanelProps {
  heading: string;
  facts: CompanyFact[];
  headingId?: string;
  className?: string;
}

/** Rivet head. Decorative — four of them, inset from the plate's corners. */
function Rivet({ position }: { position: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute size-[9px] rounded-full bg-steel-light/70",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
        position,
      )}
    />
  );
}

/**
 * Company at a glance — the data plate.
 *
 * Modelled on the plate riveted to a piece of plant: a solid asphalt block, a
 * hi-vis bar across the top edge, four rivets, and the facts set as a precise
 * tabular list. This is what the verifying visitor came for, so everything
 * around it on the page stays quiet.
 */
export function CompanyFactsPanel({
  heading,
  facts,
  headingId = "company-at-a-glance",
  className,
}: CompanyFactsPanelProps) {
  return (
    <div className={cn("relative bg-asphalt text-concrete", className)}>
      {/* The single hi-vis moment on Home. */}
      <div aria-hidden="true" className="h-[3px] w-full bg-survey" />

      <Rivet position="left-4 top-6 md:left-6 md:top-8" />
      <Rivet position="right-4 top-6 md:right-6 md:top-8" />
      <Rivet position="bottom-6 left-4 md:bottom-8 md:left-6" />
      <Rivet position="bottom-6 right-4 md:bottom-8 md:right-6" />

      <div className="px-8 py-10 md:px-14 md:py-14">
        <Heading level={2} text={heading} id={headingId} className="text-concrete" />

        <dl className="mt-8 border-t border-rule-dark">
          {facts.map((fact) => (
            <div
              key={fact.id}
              className="border-b border-rule-dark py-4 md:flex md:items-baseline md:gap-8"
            >
              <dt className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-light wdth-body md:w-52 md:shrink-0">
                <RichText text={fact.label} />
              </dt>
              <dd className="mt-1 text-base font-medium text-concrete wdth-body md:mt-0">
                <RichText text={fact.value} />
                {fact.note ? (
                  <span className="ml-2 text-sm font-normal text-steel-light">
                    <RichText text={fact.note} />
                  </span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
