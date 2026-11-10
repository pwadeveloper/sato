import Link from "next/link";
import { ViewTransition } from "react";
import { DevelopImage } from "../DevelopImage";
import { Reveal } from "../Reveal";
import { RichText } from "../RichText";
import type { CollectionFacet } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ProjectDoor {
  category: CollectionFacet;
  count: number;
}

export interface ProjectDoorsProps {
  doors: ProjectDoor[];
  /** "1 project" / "{n} projects" */
  countOne: string;
  countMany: string;
  label: string;
  className?: string;
}

/**
 * One door per published project category: its spotlight photograph, its
 * name, its line, how much it holds.
 *
 * The photograph is the category's own — the same one on its tile at
 * /projects and at the head of its page — and it morphs into that header
 * when the door is opened, so the reader is carried rather than sent. The
 * first door runs wide; the rest share the row. A category with no projects
 * is not here at all, because `getProjectCategories()` never returns one.
 */
export function ProjectDoors({ doors, countOne, countMany, label, className }: ProjectDoorsProps) {
  return (
    <ul aria-label={label} className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-6 lg:gap-8", className)}>
      {doors.map(({ category, count }, index) => {
        const wide = index === 0;
        const countLabel = (count === 1 ? countOne : countMany).replace("{n}", String(count));

        return (
          <Reveal
            key={category.value}
            as="li"
            index={index}
            className={cn(
              "group relative flex flex-col",
              wide ? "md:col-span-2 lg:col-span-6" : "lg:col-span-3",
            )}
          >
            {category.image ? (
              <ViewTransition name={`category-${category.slug}`}>
                <DevelopImage
                  image={category.image}
                  sizes={wide ? "(min-width: 1280px) 1200px, 100vw" : "(min-width: 1024px) 50vw, 100vw"}
                  zoom
                  className={cn("w-full", wide ? "aspect-3/2 md:aspect-21/9" : "aspect-4/3")}
                />
              </ViewTransition>
            ) : (
              <div
                aria-hidden="true"
                className={cn(
                  "flex w-full items-end bg-paper p-6 dot-grid",
                  wide ? "aspect-3/2 md:aspect-21/9" : "aspect-4/3",
                )}
              >
                <span className="text-h2 wdth-display text-steel/70">
                  <RichText text={category.shortLabel || category.label} />
                </span>
              </div>
            )}

            <div className="mt-4 flex items-start justify-between gap-6">
              <div>
                <span aria-hidden="true" className="eyebrow tabular text-steel-ink">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={cn("mt-2 wdth-heading text-balance", wide ? "text-h2" : "text-h3")}>
                  <Link
                    href={`/projects/${category.slug}`}
                    className="text-asphalt no-underline after:absolute after:inset-0 after:content-['']"
                  >
                    <RichText text={category.label} />
                  </Link>
                </h3>
                {category.intro ? (
                  <p className="mt-2 max-w-(--container-measure) text-sm text-steel-ink wdth-body text-pretty">
                    <RichText text={category.intro} />
                  </p>
                ) : null}
              </div>

              <p className="eyebrow mt-1 shrink-0 text-brand-ink tabular">
                <RichText text={countLabel} />
              </p>
            </div>
          </Reveal>
        );
      })}
    </ul>
  );
}
