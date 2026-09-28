import { RichText } from "./RichText";
import type { Client } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ClientListProps {
  clients: Client[];
  className?: string;
}

/**
 * Indices for the blank cells that finish a part-filled last row.
 *
 * The rule under each name is that cell's own bottom border, so without these
 * the block's bottom edge stops short. Only the 3-column layout can be
 * ragged, so they are hidden below `lg`.
 */
function padRow(count: number): number[] {
  return Array.from({ length: (3 - (count % 3)) % 3 }, (_, index) => index);
}

/**
 * Names, in columns. Nothing else.
 *
 * This was a grouped register: category headings, the agencies engaged under
 * each government nested beneath it, room for logos. The client's
 * instruction was a simple list of names, and not a focal point — a
 * procurement officer reads this page to see whether the names are serious,
 * which takes about four seconds, and everything the old version added was
 * in the way of those four seconds.
 *
 * The parent body now stands as the single entry, so "Ogun State Government"
 * appears once rather than heading a list of six of its agencies.
 */
export function ClientList({ clients, className }: ClientListProps) {
  return (
    <ul
      className={cn(
        "grid gap-x-10 border-t border-asphalt sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {clients.map((client) => (
        <li
          key={client.slug}
          className="border-b border-rule py-3.5 text-base font-medium wdth-body"
        >
          <RichText text={client.name} />
        </li>
      ))}

      {padRow(clients.length).map((index) => (
        <li
          key={`filler-${index}`}
          aria-hidden="true"
          className="hidden border-b border-rule lg:block"
        />
      ))}
    </ul>
  );
}
