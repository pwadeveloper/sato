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

/**
 * The business value map: the source image, plus the same content as text.
 *
 * Unlike the pyramid this one is not rebuilt. It is a dependency graph with
 * crossing edges, and a hand-made SVG of it would either lose the crossings —
 * which are the point, since one solution feeds several improvements — or
 * take more care to keep true than it would ever be worth. So the drawing is
 * shown as drawn.
 *
 * That makes the text alternative load-bearing rather than a courtesy: it is
 * the only version a screen reader, or anyone on a 360px screen, can
 * actually use. It is a real table with real headers, inside a `<details>`
 * so it does not double the length of the page for readers who can see the
 * diagram.
 *
 * The image is a plain `<img>`, not `next/image`: the loader would build a
 * srcset and serve the 800px file on a phone, where the labels are already
 * at the limit of legibility. One file, at full size, inside a scroller.
 */
export function ValueMap({
  map,
  headingId,
  headingLevel = 2,
  className,
}: ValueMapProps) {
  const HeadingTag = `h${headingLevel}` as const;
  const head =
    "py-3 pr-6 text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body";

  return (
    <div className={cn(className)}>
      <HeadingTag
        id={headingId}
        className={
          headingLevel === 2
            ? "text-h3 wdth-heading text-balance"
            : "text-xl font-bold wdth-heading text-balance"
        }
      >
        <RichText text={map.heading} />
      </HeadingTag>

      {map.intro ? (
        <p className="mt-3 max-w-(--container-measure) text-base text-steel-ink wdth-body">
          <RichText text={map.intro} />
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto border border-rule bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={map.image.src}
          alt={map.image.alt}
          width={map.image.width}
          height={map.image.height}
          loading="lazy"
          decoding="async"
          className="h-auto w-full min-w-[40rem] max-w-none"
        />
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
