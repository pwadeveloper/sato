import { RichText } from "./RichText";
import type { CapabilityBlock } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface CapabilityBlocksProps {
  blocks: CapabilityBlock[];
  heading?: string;
  headingId?: string;
  className?: string;
}

/**
 * Capabilities grouped under their own headings.
 *
 * A service whose offer spans three distinct disciplines cannot use the flat
 * sidebar list — thirty undifferentiated bullets tell a procurement reader
 * nothing about which of them belong together.
 */
export function CapabilityBlocks({
  blocks,
  heading,
  headingId,
  className,
}: CapabilityBlocksProps) {
  return (
    <div className={cn(className)}>
      {heading ? (
        <h2 id={headingId} className="text-h2 wdth-heading text-balance">
          <RichText text={heading} />
        </h2>
      ) : null}

      <div className="mt-8 flex flex-col gap-10">
        {blocks.map((block, index) => (
          <section key={block.id} aria-labelledby={`capability-${block.id}`}>
            <div className="flex items-baseline gap-4 border-t-[3px] border-brand pt-4">
              <span
                aria-hidden="true"
                className="text-2xs font-bold tabular text-brand-ink wdth-body"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3
                id={`capability-${block.id}`}
                className="text-xl font-bold wdth-heading text-balance"
              >
                <RichText text={block.heading} />
              </h3>
            </div>

            <ul className="mt-4">
              {block.items.map((item) => (
                <li
                  key={item}
                  className="border-b border-rule py-3 text-base wdth-body last:border-b-0"
                >
                  <RichText text={item} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
