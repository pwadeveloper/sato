import Image from "next/image";
import Link from "next/link";
import { RichText } from "./RichText";
import { Tag } from "./Tag";
import type { Project } from "@/lib/content-types";
import { isCompleted } from "@/lib/content";
import { isKnown } from "@/lib/placeholders";
import { cn } from "@/lib/cn";

export interface ProjectCardProps {
  project: Project;
  /** Human label for the sector, from the page's facets. */
  sectorLabel: string;
  /** Heading level, so the card fits the page's outline. */
  headingLevel?: 2 | 3;
  /**
   * `wide` turns the card side-on from `md` up, for the lead item in a
   * selected-projects row. Everything else stays identical.
   */
  layout?: "stacked" | "wide";
  className?: string;
}

export function ProjectCard({
  project,
  sectorLabel,
  headingLevel = 3,
  layout = "stacked",
  className,
}: ProjectCardProps) {
  const Tag_ = `h${headingLevel}` as const;
  const image = project.images[0];
  const isWide = layout === "wide";
  const showYear = isKnown(project.year);
  const showStatus = isCompleted(project.status);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col border border-rule bg-white transition-colors duration-150",
        "hover:border-steel focus-within:border-steel",
        isWide && "md:grid md:grid-cols-2 md:items-stretch",
        className,
      )}
    >
      {image ? (
        <div
          className={cn(
            "relative w-full overflow-hidden bg-steel/10",
            isWide ? "aspect-3/2 md:aspect-auto md:h-full" : "aspect-3/2",
          )}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={
              isWide
                ? "(min-width: 768px) 50vw, 100vw"
                : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            }
            className="object-cover"
          />
        </div>
      ) : (
        /* No photograph for this project yet. The slot keeps the image's exact
           proportions so rows stay aligned, and fills it with the sector set
           as type — an empty or grey box would read as a broken image, and a
           short card would leave a hole in the grid. */
        <div
          aria-hidden="true"
          className={cn(
            "relative flex w-full items-end overflow-hidden bg-concrete p-6",
            isWide ? "aspect-3/2 md:aspect-auto md:h-full" : "aspect-3/2",
          )}
        >
          <span className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
          <span className="text-h2 wdth-display leading-none text-steel/80">
            <RichText text={sectorLabel} />
          </span>
        </div>
      )}

      <div
        className={cn(
          "flex flex-1 flex-col gap-3 p-6",
          isWide && "md:justify-center md:p-8 lg:p-10",
        )}
      >
        <Tag label={sectorLabel} className="self-start" />

        <Tag_
          className={cn(
            "wdth-heading text-balance",
            isWide ? "text-h2" : "text-h3",
          )}
        >
          <Link
            href={`/projects/${project.slug}`}
            className="no-underline after:absolute after:inset-0 after:content-['']"
          >
            <RichText text={project.title} />
          </Link>
        </Tag_>

        {isKnown(project.client) ? (
          <p className="text-sm text-steel-ink wdth-body">
            <RichText text={project.client} />
          </p>
        ) : null}

        {isWide && project.summary ? (
          <p className="max-w-(--container-measure) text-base text-steel-ink wdth-body">
            <RichText text={project.summary} />
          </p>
        ) : null}

        {/* Only a confirmed "Completed" earns a badge. An unresolved status
            shows nothing rather than a hedge — see `isCompleted`. */}
        {showYear || showStatus ? (
          <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-2 text-xs text-steel-ink tabular wdth-body">
            {showYear ? <RichText text={project.year} /> : null}
            {showStatus ? (
              <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.06em] text-brand-ink">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
                <RichText text={project.status} />
              </span>
            ) : null}
          </p>
        ) : null}
      </div>
    </article>
  );
}
