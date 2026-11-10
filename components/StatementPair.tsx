import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";
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
  return (
    <div className={cn("grid gap-px bg-rule md:grid-cols-2", className)}>
      {statements.map((statement, index) => (
        <Reveal
          key={statement.id}
          as="section"
          index={index}
          className="flex flex-col gap-5 bg-paper py-8 md:px-10 md:py-10 md:first:pl-0 md:last:pr-0"
        >
          <Eyebrow
            text={statement.label}
            index={index + 1}
            tone="brand"
            as={headingLevel === 2 ? "h2" : "h3"}
            id={`${statement.id}-label`}
          />

          {statement.body.map((paragraph, position) => (
            <p
              key={position}
              className="max-w-(--container-measure) text-xl font-medium text-asphalt wdth-body text-pretty"
            >
              <RichText text={paragraph} />
            </p>
          ))}
        </Reveal>
      ))}
    </div>
  );
}
