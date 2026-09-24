import Image from "next/image";
import { RichText } from "./RichText";
import type { Client, CollectionFacet } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ClientListProps {
  clients: Client[];
  /** Category groups, in display order, from the page content. */
  groups?: CollectionFacet[];
  headingLevel?: 2 | 3;
  className?: string;
}

/**
 * A typeset register, not a logo strip.
 *
 * Sato holds no client logo files, and for a procurement reader a ministry's
 * name set in type beside a hairline carries more than a traced or
 * low-resolution mark would. `logo` is honoured where a client has one, so
 * real marks can arrive one at a time without the layout changing shape.
 */
/**
 * Indices for the blank cells that finish a part-filled last row.
 *
 * The rule under each name is that cell's own bottom border, so without these
 * the block's bottom edge stops short. Only the 3-column layout can be ragged,
 * so they are hidden below `lg`.
 */
function padRow(count: number): number[] {
  return Array.from({ length: (3 - (count % 3)) % 3 }, (_, index) => index);
}

/** The client's mark where one exists, otherwise its name set as type. */
function ClientName({ client, className }: { client: Client; className?: string }) {
  if (client.logo) {
    return (
      <Image
        src={client.logo.src}
        alt={client.logo.alt}
        width={client.logo.width ?? 200}
        height={client.logo.height ?? 64}
        className={cn("h-10 w-auto max-w-[12rem] object-contain", className)}
      />
    );
  }

  return (
    <p className={cn("wdth-body", className)}>
      <RichText text={client.name} />
    </p>
  );
}

export function ClientList({
  clients,
  groups,
  headingLevel = 3,
  className,
}: ClientListProps) {
  const GroupHeading = `h${headingLevel}` as const;

  if (!groups?.length) {
    return (
      <ul className={cn("grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {clients.map((client) => (
          <li key={client.slug} className="border-b border-rule py-4 text-base wdth-body">
            <ClientName client={client} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={cn("flex flex-col gap-12", className)}>
      {groups.map((group) => {
        const members = clients.filter((client) => client.category === group.value);
        if (!members.length) return null;

        return (
          <section key={group.value}>
            <GroupHeading className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body">
              <RichText text={group.label} />
            </GroupHeading>

            <ul className="mt-4 grid gap-x-8 border-t border-asphalt sm:grid-cols-2 lg:grid-cols-3">
              {members.map((client) => (
                <li key={client.slug} className="border-b border-rule py-4">
                  <ClientName client={client} className="text-base font-medium" />
                  {client.parent ? (
                    <p className="mt-1 text-xs text-steel-ink wdth-body">
                      <RichText text={client.parent} />
                    </p>
                  ) : null}
                  {client.units?.length ? (
                    <ul className="mt-2 flex flex-col gap-1">
                      {client.units.map((unit) => (
                        <li key={unit} className="text-sm text-steel-ink wdth-body">
                          <RichText text={unit} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}

              {padRow(members.length).map((index) => (
                <li
                  key={`filler-${index}`}
                  aria-hidden="true"
                  className="hidden border-b border-rule lg:block"
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
