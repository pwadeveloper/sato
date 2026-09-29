import Image from "next/image";

import { Heading } from "./Heading";
import { RichText } from "./RichText";
import { TextLink } from "./TextLink";
import type { ServiceSectionGroup } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ServiceSectionGroupsProps {
  groups: ServiceSectionGroup[];
  /** Namespaces the generated heading ids, e.g. `capabilities`. */
  idPrefix: string;
  /** Link label for a group that carries an `href` but names no label. */
  defaultLinkLabel?: string;
  className?: string;
}

/**
 * The `h3` subsections of a service section.
 *
 * One component for all of them, because they are one thing: a named area of
 * work, with some combination of a sentence, a list, a photograph and a link
 * on. Oil & Gas's three capability areas are the list form; the
 * Infrastructure landing page's four infrastructure types are the picture
 * form; a solution area is usually a heading and two sentences. Before this,
 * each of those was its own component with its own heading size, which is
 * the inconsistency the client picked out.
 *
 * The numbering and the brand rule come from the old `CapabilityBlocks`. They
 * do real work on a long page: they tell a reader scanning for the third
 * capability area that there are exactly three, which a run of unnumbered
 * headings does not.
 *
 * A group carrying a photograph switches the whole run to a two-column grid,
 * because a full-width picture over two sentences is a banner rather than an
 * illustration. Nothing declares the layout; it follows from the content.
 */
export function ServiceSectionGroups({
  groups,
  idPrefix,
  defaultLinkLabel,
  className,
}: ServiceSectionGroupsProps) {
  if (!groups.length) return null;

  const illustrated = groups.some((group) => group.image);

  return (
    <div
      className={cn(
        illustrated
          ? "grid gap-x-10 gap-y-12 md:grid-cols-2"
          : "flex flex-col gap-10",
        className,
      )}
    >
      {groups.map((group, index) => (
        <section key={group.id} aria-labelledby={`${idPrefix}-${group.id}`}>
          {group.image ? (
            <div className="relative mb-5 aspect-16/9 w-full bg-steel/10">
              <Image
                src={group.image.src}
                alt={group.image.alt}
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="flex items-baseline gap-4 border-t-[3px] border-brand pt-4">
            <span
              aria-hidden="true"
              className="text-2xs font-bold tabular text-brand-ink wdth-body"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <Heading
              level={3}
              size="h3"
              text={group.heading}
              id={`${idPrefix}-${group.id}`}
            />
          </div>

          {(group.description ?? []).map((paragraph, position) => (
            <p
              key={position}
              className="mt-4 max-w-(--container-measure) text-base text-steel-ink wdth-body text-pretty"
            >
              <RichText text={paragraph} />
            </p>
          ))}

          {group.items?.length ? (
            <ul className="mt-4">
              {group.items.map((item) => (
                <li
                  key={item.name}
                  className="border-b border-rule py-3 wdth-body last:border-b-0"
                >
                  <span className="block text-base">
                    <RichText text={item.name} />
                  </span>
                  {item.description ? (
                    <span className="mt-1 block text-sm text-steel-ink text-pretty">
                      <RichText text={item.description} />
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          {group.href ? (
            <p className="mt-4">
              <TextLink
                label={group.linkLabel ?? defaultLinkLabel ?? group.heading}
                href={group.href}
              />
            </p>
          ) : null}
        </section>
      ))}
    </div>
  );
}
