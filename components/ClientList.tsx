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
 * A typeset register, not a logo strip. Sato has no client logo files, and for
 * a procurement reader a ministry's name set in type beside a hairline carries
 * more than a low-resolution GIF would.
 */
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
            <RichText text={client.name} />
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
                  <p className="text-base font-medium wdth-body">
                    <RichText text={client.name} />
                  </p>
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
            </ul>
          </section>
        );
      })}
    </div>
  );
}
