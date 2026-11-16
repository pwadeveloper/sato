import { Heading } from "./Heading";
import { RichText } from "./RichText";
import type { ValueMap as ValueMapContent } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ValueMapProps {
  map: ValueMapContent;
  headingId: string;
  headingLevel?: 2 | 3;
  className?: string;
}

/** A cell's worth of items, as a list so each one is its own line. */
function Cell({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item} className="text-sm wdth-body">
          <RichText text={item} />
        </li>
      ))}
    </ul>
  );
}

/** One stage of a row: its column name (shown on a phone) and its items. */
function Stage({
  column,
  items,
  tone,
}: {
  column: string;
  items: string[];
  tone: "plain" | "benefit";
}) {
  return (
    <div
      className={cn(
        "border p-3.5",
        tone === "benefit" ? "border-brand/40 bg-brand-tint" : "border-rule bg-concrete",
      )}
    >
      <p className="eyebrow text-xs! text-steel-ink md:hidden">
        <RichText text={column} />
      </p>
      <ul className="mt-1.5 flex flex-col gap-1 md:mt-0">
        {items.map((item) => (
          <li key={item} className="text-sm leading-snug wdth-body">
            <RichText text={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The connector between two stages: across on a desktop, down on a phone. */
function Arrow() {
  return (
    <span
      aria-hidden="true"
      className="flex items-center justify-center py-1 text-brand md:py-0"
    >
      <span className="md:hidden">&darr;</span>
      <span className="hidden md:inline">&rarr;</span>
    </span>
  );
}

/**
 * The business value map, drawn from its rows.
 *
 * Each business process runs across the page: the process, the solutions
 * applied to it, the improvement they produce and the benefit returned. On a
 * phone each row stacks downward with the column named on every stage, so no
 * label is ever smaller than body text — the reason the deck's raster could
 * not stay (the oil and gas brief also rules out screenshots of slides).
 *
 * The drawing is one `role="img"` with a summary label; the table in the
 * disclosure underneath is the full text version for a screen reader.
 */
export function ValueMap({
  map,
  headingId,
  headingLevel = 2,
  className,
}: ValueMapProps) {

  const head =
    "py-3 pr-6 eyebrow text-steel-ink";
  const grid =
    "md:grid md:grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1.25fr)_1.5rem_minmax(0,1.25fr)_1.5rem_minmax(0,1fr)] md:items-stretch";

  return (
    <div className={cn(className)}>
      <Heading
        level={headingLevel}
        size={headingLevel === 2 ? "h2" : "h3"}
        text={map.heading}
        id={headingId}
      />

      {map.intro ? (
        <p className="mt-3 max-w-(--container-measure) text-base text-steel-ink wdth-body">
          <RichText text={map.intro} />
        </p>
      ) : null}

      <div
        role="img"
        aria-label={map.alt}
        className="mt-6 border border-rule bg-paper p-3 md:p-5"
      >
        <div aria-hidden="true" className={cn("hidden pb-3", grid)}>
          {[map.columns.process, map.columns.solutions, map.columns.improvements, map.columns.benefits].map(
            (column, index) => (
              <p
                key={column}
                className="eyebrow text-xs! text-steel-ink"
                style={{ gridColumn: index * 2 + 1 }}
              >
                <RichText text={column} />
              </p>
            ),
          )}
        </div>

        <div className="flex flex-col gap-5 md:gap-3">
          {map.rows.map((row) => (
            <div key={row.id} className={cn("flex flex-col", grid)} data-anim="fade">
              <div className="bg-asphalt p-3.5 text-concrete">
                <p className="eyebrow text-xs! text-steel-light md:hidden">
                  <RichText text={map.columns.process} />
                </p>
                <p className="mt-1.5 text-sm font-semibold leading-snug wdth-body md:mt-0">
                  <RichText text={row.process} />
                </p>
                {row.note ? (
                  <p className="mt-1 text-xs text-steel-light wdth-body">
                    <RichText text={row.note} />
                  </p>
                ) : null}
              </div>
              <Arrow />
              <Stage column={map.columns.solutions} items={row.solutions} tone="plain" />
              <Arrow />
              <Stage column={map.columns.improvements} items={row.improvements} tone="plain" />
              <Arrow />
              <Stage column={map.columns.benefits} items={row.benefits} tone="benefit" />
            </div>
          ))}
        </div>
      </div>

      <details className="mt-4 border-t border-rule pt-4">
        <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-brand-ink underline underline-offset-[0.2em] wdth-body">
          <RichText text={map.alternativeLabel} />
        </summary>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left sm:min-w-[44rem]">
            <thead>
              <tr className="border-y border-asphalt align-bottom">
                <th scope="col" className={head}>
                  <RichText text={map.columns.process} />
                </th>
                <th scope="col" className={head}>
                  <RichText text={map.columns.solutions} />
                </th>
                <th scope="col" className={head}>
                  <RichText text={map.columns.improvements} />
                </th>
                <th scope="col" className={head}>
                  <RichText text={map.columns.benefits} />
                </th>
              </tr>
            </thead>
            <tbody>
              {map.rows.map((row) => (
                <tr key={row.id} className="border-b border-rule align-top">
                  <th
                    scope="row"
                    className="py-4 pr-6 text-sm font-semibold wdth-body"
                  >
                    <RichText text={row.process} />
                    {row.note ? (
                      <span className="mt-1 block text-xs font-normal text-steel-ink">
                        <RichText text={row.note} />
                      </span>
                    ) : null}
                  </th>
                  <td className="py-4 pr-6">
                    <Cell items={row.solutions} />
                  </td>
                  <td className="py-4 pr-6">
                    <Cell items={row.improvements} />
                  </td>
                  <td className="py-4">
                    <Cell items={row.benefits} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
