import { Heading } from "./Heading";
import { RichText } from "./RichText";
import type { FlowBlock } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface FlowDiagramProps {
  block: FlowBlock;
  headingId: string;
  headingLevel?: 2 | 3;
  className?: string;
}

/**
 * A flow of stages, left to right on a desktop and top to bottom on a phone.
 *
 * Used for the advisory system (field data to the operator's decision) and
 * for asset performance management (plant and pipeline data to what the
 * model shows). It is an ordered list of real text, so a screen reader reads
 * the stages in order without a separate alternative; `block.label` names
 * the list as a whole.
 *
 * Deliberately high level. The brief keeps system architecture at the level
 * of stages, so the content model has no field for anything finer.
 */
export function FlowDiagram({
  block,
  headingId,
  headingLevel = 3,
  className,
}: FlowDiagramProps) {
  const last = block.steps.length - 1;

  return (
    <div className={cn(className)}>
      <Heading
        level={headingLevel}
        size={headingLevel === 2 ? "h2" : "h3"}
        text={block.heading}
        id={headingId}
      />

      {block.intro ? (
        <p className="mt-3 max-w-(--container-measure) text-base text-steel-ink wdth-body">
          <RichText text={block.intro} />
        </p>
      ) : null}

      {block.quote ? (
        <blockquote className="mt-6 max-w-[40rem] border-l-[3px] border-brand pl-5">
          <p className="font-bold wdth-heading text-2xl leading-tight tracking-[-0.01em] text-asphalt text-pretty md:text-3xl">
            <RichText text={block.quote} />
          </p>
        </blockquote>
      ) : null}

      <ol
        aria-label={block.label}
        className="mt-8 flex flex-col md:flex-row md:items-stretch"
      >
        {block.steps.map((step, index) => (
          <li
            key={step.id}
            className="flex flex-col md:flex-1 md:flex-row"
            data-anim="fade"
            data-delay={index * 80}
          >
            <div
              className={cn(
                "flex-1 border p-4 md:p-5",
                index === last ? "border-asphalt bg-asphalt text-concrete" : "border-rule bg-concrete",
              )}
            >
              <p
                aria-hidden="true"
                className={cn(
                  "eyebrow tabular text-xs!",
                  index === last ? "text-brand-light" : "text-steel-ink",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 text-base font-medium leading-snug wdth-body text-balance">
                <RichText text={step.label} />
              </p>
              {step.items?.length ? (
                <ul className="mt-3 flex flex-col">
                  {step.items.map((item) => (
                    <li
                      key={item}
                      className={cn(
                        "border-t py-1.5 text-sm leading-snug wdth-body",
                        index === last ? "border-rule-dark text-concrete" : "border-rule text-steel-ink",
                      )}
                    >
                      <RichText text={item} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {index < last ? (
              <span
                aria-hidden="true"
                className="flex items-center justify-center py-1.5 text-lg text-brand md:w-8 md:py-0"
              >
                <span className="md:hidden">&darr;</span>
                <span className="hidden md:inline">&rarr;</span>
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      {block.returnLabel ? (
        <div className="mt-2">
          {/* The loop back to the first stage, drawn under the row. */}
          <div
            aria-hidden="true"
            className="relative mx-[10%] hidden h-5 rounded-b-lg border-x-2 border-b-2 border-brand/50 md:block"
          >
            <span className="absolute -top-1.5 -left-[7px] text-xs leading-none text-brand">&#9650;</span>
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm font-medium text-brand-ink wdth-body md:justify-center">
            <span aria-hidden="true">&#8634;</span>
            <RichText text={block.returnLabel} />
          </p>
        </div>
      ) : null}

      {block.lists?.length ? (
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {block.lists.map((list) => (
            <section key={list.id} aria-labelledby={`${headingId}-${list.id}`}>
              <Heading level={4} size="h4" text={list.heading} id={`${headingId}-${list.id}`} />
              <ul className="mt-3 border-t border-asphalt">
                {list.items.map((item) => (
                  <li key={item} className="border-b border-rule py-2.5 text-base wdth-body">
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
