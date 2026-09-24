import Image from "next/image";
import Link from "next/link";
import { RichText } from "./RichText";
import { Tag } from "./Tag";
import type { Project } from "@/lib/content-types";
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
        /* No photography yet. A rule reads as deliberate where an empty grey
           box would read as broken. */
        <div aria-hidden="true" className="h-[3px] w-full bg-laterite md:h-full md:w-[3px]" />
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

        <p className="text-sm text-steel-ink wdth-body">
          <RichText text={project.client} />
        </p>

        {isWide && project.summary ? (
          <p className="max-w-(--container-measure) text-base text-steel-ink wdth-body">
            <RichText text={project.summary} />
          </p>
        ) : null}

        <p className="mt-auto pt-2 text-xs text-steel-ink tabular wdth-body">
          <RichText text={project.year} />
          <span aria-hidden="true" className="px-2 text-steel">
            ·
          </span>
          <RichText text={project.status} />
        </p>
      </div>
    </article>
  );
}
