import { Heading } from "./Heading";
import { RichText } from "./RichText";
import type { CycleBlock } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface CycleDiagramProps {
  block: CycleBlock;
  headingId: string;
  headingLevel?: 2 | 3;
  className?: string;
}

const SIZE = 320;
const CENTRE = SIZE / 2;
const RADIUS = 128;
const NODE = 18;

/** A point on the ring, `index` steps of `count` round from twelve o'clock. */
function at(index: number, count: number, radius = RADIUS) {
  const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
  return {
    x: CENTRE + radius * Math.cos(angle),
    y: CENTRE + radius * Math.sin(angle),
    angle,
  };
}

/** The arc from one node to the next, stopping short of both circles. */
function arc(index: number, count: number) {
  const gap = (NODE + 7) / RADIUS;
  const from = -Math.PI / 2 + (index / count) * Math.PI * 2 + gap;
  const to = -Math.PI / 2 + ((index + 1) / count) * Math.PI * 2 - gap;
  const x1 = CENTRE + RADIUS * Math.cos(from);
  const y1 = CENTRE + RADIUS * Math.sin(from);
  const x2 = CENTRE + RADIUS * Math.cos(to);
  const y2 = CENTRE + RADIUS * Math.sin(to);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${RADIUS} ${RADIUS} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/**
 * A closed loop of numbered steps: the ring drawn in SVG, the steps listed
 * beside it as text.
 *
 * The ring carries only the numbers, so its labels never have to shrink to
 * fit a phone — the steps themselves are an ordered list in the page's own
 * type, and the numbers on the ring match it. The SVG is `role="img"` with
 * a label describing the loop; the list is what a screen reader reads.
 *
 * The viewBox is 320 units wide and the drawing never renders wider than
 * 20rem, so at a 360px viewport its 14-unit numbers are still about 13px.
 */
export function CycleDiagram({
  block,
  headingId,
  headingLevel = 3,
  className,
}: CycleDiagramProps) {
  const count = block.steps.length;
  const marker = `${headingId}-arrow`;
  const centre = block.centre;

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

      <div className="mt-8 grid items-center gap-10 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-14">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={block.alt}
          className="mx-auto w-full max-w-[20rem]"
          data-anim="fade"
        >
          <defs>
            <marker
              id={marker}
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-brand" />
            </marker>
          </defs>

          {block.steps.map((step, index) => (
            <path
              key={`arc-${step}`}
              d={arc(index, count)}
              fill="none"
              strokeWidth="2"
              className="stroke-brand/70"
              markerEnd={`url(#${marker})`}
            />
          ))}

          {block.steps.map((step, index) => {
            const point = at(index, count);
            return (
              <g key={`node-${step}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={NODE}
                  className={index === 0 ? "fill-brand" : "fill-asphalt"}
                />
                <text
                  x={point.x}
                  y={point.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-white font-mono"
                  fontSize="14"
                >
                  {index + 1}
                </text>
              </g>
            );
          })}

          {centre ? (
            <g className="font-mono">
              <text
                x={CENTRE}
                y={CENTRE - 50}
                textAnchor="middle"
                fontSize="12"
                letterSpacing="1.2"
                className="fill-steel-ink uppercase"
              >
                {centre.label}
              </text>
              {centre.steps.map((step, index) => (
                <text
                  key={step}
                  x={CENTRE}
                  y={CENTRE - 22 + index * 22}
                  textAnchor="middle"
                  fontSize="14"
                  className="fill-asphalt"
                >
                  {index ? "↓ " : ""}
                  {step}
                </text>
              ))}
            </g>
          ) : null}
        </svg>

        <ol className="border-t border-asphalt">
          {block.steps.map((step, index) => (
            <li
              key={step}
              className="flex items-baseline gap-4 border-b border-rule py-3"
              data-anim="fade"
              data-delay={index * 60}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs text-white",
                  index === 0 ? "bg-brand" : "bg-asphalt",
                )}
              >
                {index + 1}
              </span>
              <span className="text-base wdth-body text-pretty">
                <RichText text={step} />
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
