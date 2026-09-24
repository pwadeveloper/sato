import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

export interface Statement {
  id: string;
  label: string;
  body: string[];
}

export interface StatementPairProps {
  statements: Statement[];
  headingLevel?: 2 | 3;
  className?: string;
}

/**
 * Mission and vision, side by side.
 *
 * Set as two plain statements under small labels — no quotation marks, no
 * oversized glyph, no centred italic. A company's mission is a claim it stands
 * behind, so it is set in the same voice as the rest of the page and simply
 * given room.
 */
export function StatementPair({
  statements,
  headingLevel = 2,
  className,
}: StatementPairProps) {
  const Label = `h${headingLevel}` as const;

  return (
    <div className={cn("grid gap-px bg-rule md:grid-cols-2", className)}>
      {statements.map((statement) => (
        <section
          key={statement.id}
          aria-labelledby={`${statement.id}-label`}
          className="flex flex-col gap-4 bg-concrete py-8 md:px-8 md:py-10 md:first:pl-0 md:last:pr-0"
        >
          <Label
            id={`${statement.id}-label`}
            className="text-2xs font-semibold uppercase tracking-[0.08em] text-laterite wdth-body"
          >
            <RichText text={statement.label} />
          </Label>

          {statement.body.map((paragraph, index) => (
            <p
              key={index}
              className="max-w-(--container-measure) text-lg text-asphalt wdth-body text-pretty"
            >
              <RichText text={paragraph} />
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
