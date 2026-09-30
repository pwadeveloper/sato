import Image from "next/image";
import Link from "next/link";
import { RichText } from "./RichText";
import { Tag } from "./Tag";
import type { ImageRef, Project } from "@/lib/content-types";
import { isCompleted } from "@/lib/content";
import { isKnown } from "@/lib/placeholders";
import { cn } from "@/lib/cn";

export interface ProjectCardProps {
  project: Project;
  /** Human label for the sector, from the page's facets. */
  sectorLabel: string;
  /**
   * The short form, for the pill and the no-photograph slot. Falls back to
   * `sectorLabel` where a caller has nothing shorter.
   */
  sectorShortLabel?: string;
  /**
   * Whether the card names its category — on the pill, and in the slot that
   * stands in for a missing photograph. False on a category page, where the
   * heading above the grid already said it and every card would otherwise
   * repeat it, in some cases at display size, a dozen times over.
   */
  showSector?: boolean;
  /** Heading level, so the card fits the page's outline. */
  headingLevel?: 2 | 3;
  /**
   * `wide` turns the card side-on from `md` up, for the lead item in a
   * selected-projects row. Everything else stays identical.
   */
  layout?: "stacked" | "wide";
  /**
   * A generic photograph of Sato's work, shown when this project has none of
   * its own. Resolved by `getProjectPlaceholder()` from the category, and
   * never passed on the project detail page — see `CollectionFacet`.
   */
  fallbackImage?: ImageRef;
  /**
   * Whether to print the year. Comes from `showProjectDates` in site.json —
   * passed in rather than read here, so the card stays a pure component and
   * one flag controls every date on the site.
   */
  showDates?: boolean;
  className?: string;
}

export function ProjectCard({
  project,
  sectorLabel,
  sectorShortLabel,
  showSector = true,
  headingLevel = 3,
  layout = "stacked",
  showDates = true,
  fallbackImage,
  className,
}: ProjectCardProps) {
  const Tag_ = `h${headingLevel}` as const;
  // The project's own photograph wins. A stand-in only ever fills a gap, and
  // stops being used the moment the real one lands in projects.json.
  const image = project.images[0] ?? fallbackImage;
  const shortLabel = sectorShortLabel || sectorLabel;
  const isWide = layout === "wide";
  const showYear = showDates && isKnown(project.year);
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
        /* No photograph for this project yet. The slot keeps the image's
           exact proportions so rows stay aligned, and the brand rule across
           the top makes it read as a panel rather than as an image that
           failed to load. In a mixed grid it carries the category set as
           type; on a category page it stays empty, because the alternative
           is the same word at display size in every cell of the grid. */
        <div
          aria-hidden="true"
          className={cn(
            "relative flex w-full items-end overflow-hidden bg-concrete p-6",
            isWide ? "aspect-3/2 md:aspect-auto md:h-full" : "aspect-3/2",
          )}
        >
          <span className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
          {showSector ? (
            <span className="text-h2 wdth-display leading-none text-steel/80 text-balance">
              <RichText text={shortLabel} />
            </span>
          ) : null}
        </div>
      )}

      <div
        className={cn(
          "flex flex-1 flex-col gap-3 p-6",
          isWide && "md:justify-center md:p-8 lg:p-10",
        )}
      >
        {showSector ? <Tag label={shortLabel} className="self-start" /> : null}

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
