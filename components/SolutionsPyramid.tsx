import { RichText } from "./RichText";
import type { SolutionsPyramid as PyramidContent } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface SolutionsPyramidProps {
  pyramid: PyramidContent;
  headingId: string;
  headingLevel?: 2 | 3;
  className?: string;
}

/**
 * Geometry of a 540-wide, 320-tall pyramid cut into four bands.
 *
 * Half-width grows linearly from the apex, so a band's corners are just its
 * two cut heights. Computing it beats four hand-written polygon strings: the
 * tiers come from content, and a fifth one would otherwise need new numbers.
 */
const APEX_Y = 10;
const BASE_Y = 330;
const HALF_BASE = 270;
const CENTRE = 300;

function halfWidthAt(y: number): number {
  return ((y - APEX_Y) / (BASE_Y - APEX_Y)) * HALF_BASE;
}

/**
 * The tonal ramp, apex down. One hue, four steps — the site has no second
 * colour, and the source diagram's red/blue/yellow/green would have imported
 * one. Each pairing is above 4.5:1, so the labels are readable rather than
 * decorative.
 */
const BANDS = [
  { fill: "var(--color-brand-deep)", ink: "var(--color-concrete)" },
  { fill: "var(--color-brand)", ink: "var(--color-concrete)" },
  { fill: "var(--color-brand-light)", ink: "var(--color-asphalt)" },
  { fill: "var(--color-brand-tint)", ink: "var(--color-asphalt)" },
];

/**
 * The four tiers of the solutions stack, drawn rather than shipped.
 *
 * The source is a PNG whose labels are unreadable on a phone, invisible to a
 * screen reader and set in colours from another company's palette. Rebuilt
 * as SVG it scales, takes the brand ramp, and — because the tiers are
 * content, not a picture — the items under each one are real text that can
 * be read, searched and translated. (The source also spells the base tier
 * "Surveilance"; it is spelled correctly here.)
 *
 * The diagram carries numbers, not names. Fitting seven labels into the base
 * band is what made the original illegible, and the apex band is narrower
 * than the word "Transformation" at any size worth reading — so the bands are
 * numbered, and the names and their items sit beneath as a keyed legend.
 * A number always fits, at every width, in every tier.
 */
export function SolutionsPyramid({
  pyramid,
  headingId,
  headingLevel = 2,
  className,
}: SolutionsPyramidProps) {
  const HeadingTag = `h${headingLevel}` as const;

  // Apex first, so the drawing order matches the visual order top to bottom.
  const tiers = [...pyramid.tiers].reverse();
  const step = (BASE_Y - APEX_Y) / tiers.length;

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
        <RichText text={pyramid.heading} />
      </HeadingTag>

      {pyramid.intro ? (
        <p className="mt-3 max-w-(--container-measure) text-base text-steel-ink wdth-body">
          <RichText text={pyramid.intro} />
        </p>
      ) : null}

      <svg
        viewBox="0 0 600 340"
        role="img"
        aria-label={pyramid.alt}
        className="mt-6 block w-full max-w-[34rem]"
      >
        {tiers.map((tier, index) => {
          const top = APEX_Y + index * step;
          const bottom = APEX_Y + (index + 1) * step;
          const topHalf = halfWidthAt(top);
          const bottomHalf = halfWidthAt(bottom);
          const band = BANDS[index % BANDS.length];

          return (
            <g key={tier.id}>
              <polygon
                points={[
                  `${CENTRE - topHalf},${top}`,
                  `${CENTRE + topHalf},${top}`,
                  `${CENTRE + bottomHalf},${bottom}`,
                  `${CENTRE - bottomHalf},${bottom}`,
                ].join(" ")}
                fill={band.fill}
                stroke="var(--color-concrete)"
                strokeWidth="2"
              />
              <text
                x={CENTRE}
                // Nudged down: the apex band's usable width is at its foot,
                // so a number sitting on the mid-line would touch the edges.
                y={(top + bottom) / 2 + (index === 0 ? 14 : 0)}
                textAnchor="middle"
                dominantBaseline="central"
                fill={band.ink}
                fontSize="30"
                fontWeight="800"
                className="tabular wdth-heading"
              >
                {String(tiers.length - index).padStart(2, "0")}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier, index) => (
          <div key={tier.id}>
            <h4 className="flex items-center gap-2 border-b border-asphalt pb-2 text-2xs font-semibold uppercase tracking-[0.08em] text-asphalt wdth-body">
              {/* Swatch and number both key the column to its band, so the
                  pairing survives a reader who cannot tell the greens apart. */}
              <span
                aria-hidden="true"
                className="flex size-5 shrink-0 items-center justify-center border border-rule text-[0.6rem] font-bold tabular"
                style={{
                  backgroundColor: BANDS[index % BANDS.length].fill,
                  color: BANDS[index % BANDS.length].ink,
                }}
              >
                {String(tiers.length - index).padStart(2, "0")}
              </span>
              <RichText text={tier.label} />
            </h4>
            <ul>
              {tier.items.map((item) => (
                <li
                  key={item}
                  className="border-b border-rule py-2 text-sm wdth-body"
                >
                  <RichText text={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
