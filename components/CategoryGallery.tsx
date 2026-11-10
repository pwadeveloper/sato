import Link from "next/link";
import { ViewTransition } from "react";

import { DevelopImage } from "./DevelopImage";
import { Reveal } from "./Reveal";
import { RichText } from "./RichText";
import type { CategoryPhoto } from "@/lib/content";
import type { Project } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface CategoryGalleryProps {
  photos: CategoryPhoto[];
  /** Labels the photograph region. */
  label: string;
  className?: string;
}

/**
 * A category's photographs, mixed together, each with its caption beneath it.
 *
 * The client's format: image and caption only, the caption in small plain
 * text. No titles over the pictures, no bold, no badges. A photograph of a
 * project links to that project's page, so the gallery is also the way in —
 * the link is the whole figure, and it looks like nothing but the picture.
 * A project's lead photograph morphs into the one at the top of its page.
 *
 * Portrait photographs sit whole inside the 4:3 frame rather than being cut
 * to their middle, because the caption describes the whole frame.
 */
export function CategoryGallery({ photos, label, className }: CategoryGalleryProps) {
  if (!photos.length) return null;

  return (
    <section aria-label={label} className={cn(className)}>
      <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map(({ image, project }, index) => {
          const portrait = (image.height ?? 0) > (image.width ?? 0);
          // The first photograph leads the gallery at twice the size.
          const lead = index === 0 && !portrait;
          const isLead = Boolean(project && project.images[0]?.src === image.src);
          const box = (
            <DevelopImage
              image={image}
              sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
              priority={index < 3}
              develop={index < 3 ? "load" : "view"}
              contain={portrait}
              zoom={Boolean(project)}
              className={lead ? "aspect-4/3 w-full lg:aspect-auto lg:h-[calc(100%-2.5rem)]" : "aspect-4/3 w-full"}
            />
          );
          const figure = (
            <figure className="m-0 h-full">
              {isLead && project ? (
                <ViewTransition name={`project-${project.slug}`}>{box}</ViewTransition>
              ) : (
                box
              )}
              <figcaption className="mt-3 flex items-baseline gap-3 text-sm font-normal text-steel-ink wdth-body text-pretty">
                <span aria-hidden="true" className="eyebrow tabular text-steel">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {image.caption ? <RichText text={image.caption} /> : null}
              </figcaption>
            </figure>
          );

          return (
            <Reveal
              key={image.src}
              as="li"
              index={index % 3}
              className={lead ? "sm:col-span-2 lg:row-span-2" : undefined}
            >
              {project ? (
                <Link
                  href={`/projects/${project.slug}`}
                  className="group block h-full no-underline focus-visible:outline-offset-4"
                >
                  {figure}
                </Link>
              ) : (
                figure
              )}
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}

export interface ProjectListProps {
  projects: Project[];
  heading: string;
  headingId: string;
  className?: string;
}

/**
 * Every project in the category as a plain list — title, then client and
 * place — the way the old site set its project tables under the photographs.
 * A project without a photograph of its own is still here, and still links
 * to its page; nothing on the page is an empty frame.
 */
export function ProjectList({ projects, heading, headingId, className }: ProjectListProps) {
  if (!projects.length) return null;

  return (
    <section aria-labelledby={headingId} className={cn(className)}>
      <h2 id={headingId} className="eyebrow border-b border-asphalt pb-3 text-steel-ink">
        <RichText text={heading} />
      </h2>
      <ol>
        {projects.map((project, index) => {
          const details = [project.client, project.location].filter(Boolean).join(" · ");
          return (
            <Reveal key={project.slug} as="li" index={Math.min(index, 4)} className="border-b border-rule">
              <Link
                href={`/projects/${project.slug}`}
                className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-4 no-underline md:grid-cols-[3.5rem_1fr_auto]"
              >
                <span aria-hidden="true" className="eyebrow tabular text-steel">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="link-draw block w-fit text-lg font-medium text-asphalt wdth-body text-pretty transition-colors duration-150 group-hover:text-brand-ink">
                    <RichText text={project.title} />
                  </span>
                  {details ? (
                    <span className="mt-1 block text-sm text-steel-ink wdth-body">
                      <RichText text={details} />
                    </span>
                  ) : null}
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-steel transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-1 group-hover:text-brand motion-reduce:transition-none"
                >
                  &rarr;
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}
