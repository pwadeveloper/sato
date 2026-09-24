import { RichText } from "./RichText";
import type { Client } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ClientStripProps {
  clients: Client[];
  className?: string;
}

/**
 * Client names set as type, on a ruled grid.
 *
 * Sato holds no client logo files, and a procurement reader trusts a ministry's
 * name set plainly more than a traced or low-resolution mark would. When real
 * logos arrive this becomes the same grid with images in the cells.
 */
export function ClientStrip({ clients, className }: ClientStripProps) {
  /**
   * The rule under each name is the cell's own bottom border, so a part-filled
   * last row would stop short and leave the block's bottom edge ragged. These
   * carry the rule across the gap. Only the 3-column layout can be ragged — at
   * one and two columns an even count always fills its rows — so they are
   * hidden below `lg`.
   */
  const fillers = (3 - (clients.length % 3)) % 3;

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-x-10 border-t border-asphalt sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {clients.map((client) => (
        <li
          key={client.slug}
          className="flex min-h-20 items-center border-b border-rule py-5"
        >
          <p className="text-base font-medium text-asphalt wdth-body text-balance">
            <RichText text={client.name} />
          </p>
        </li>
      ))}

      {Array.from({ length: fillers }, (_, index) => (
        <li key={`filler-${index}`} aria-hidden="true" className="hidden border-b border-rule lg:block" />
      ))}
    </ul>
  );
}
