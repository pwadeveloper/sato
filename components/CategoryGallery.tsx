import Image from "next/image";
import Link from "next/link";

import type { CategoryPhoto } from "@/lib/content";
import type { Project } from "@/lib/content-types";
import { cn } from "@/lib/cn";
import { RichText } from "./RichText";

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
 *
 * Portrait photographs sit whole inside the 4:3 frame rather than being cut
 * to their middle, because the caption describes the whole frame.
 */
export function CategoryGallery({ photos, label, className }: CategoryGalleryProps) {
  if (!photos.length) return null;

  return (
    <section aria-label={label} className={cn(className)}>
      <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map(({ image, project }, index) => {
          const portrait = (image.height ?? 0) > (image.width ?? 0);
          const figure = (
            <figure className="m-0">
              <div className="relative aspect-4/3 w-full overflow-hidden bg-steel/10">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index < 3}
                  sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
                  className={cn(
                    portrait ? "object-contain" : "object-cover",
                    "transition-opacity duration-150 motion-reduce:transition-none",
                    project && "group-hover:opacity-90",
                  )}
                />
              </div>
              {image.caption ? (
                <figcaption className="mt-2 text-sm font-normal text-steel-ink wdth-body text-pretty">
                  <RichText text={image.caption} />
                </figcaption>
              ) : null}
            </figure>
          );

          return (
            <li key={image.src}>
              {project ? (
                <Link
                  href={`/projects/${project.slug}`}
                  className="group block no-underline focus-visible:outline-offset-4"
                >
                  {figure}
                </Link>
              ) : (
                figure
              )}
            </li>
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
      <h2
        id={headingId}
        className="border-b border-asphalt pb-3 text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body"
      >
        <RichText text={heading} />
      </h2>
      <ul>
        {projects.map((project) => {
          const details = [project.client, project.location].filter(Boolean).join(" · ");
          return (
            <li key={project.slug} className="border-b border-rule">
              <Link
                href={`/projects/${project.slug}`}
                className="group flex items-baseline justify-between gap-4 py-3 no-underline"
              >
                <span>
                  <span className="block text-base font-normal text-asphalt wdth-body text-pretty group-hover:text-brand-ink group-hover:underline">
                    <RichText text={project.title} />
                  </span>
                  {details ? (
                    <span className="mt-0.5 block text-sm text-steel-ink wdth-body">
                      <RichText text={details} />
                    </span>
                  ) : null}
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-steel transition-transform duration-150 group-hover:translate-x-1 group-hover:text-brand motion-reduce:transition-none"
                >
                  &rarr;
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
