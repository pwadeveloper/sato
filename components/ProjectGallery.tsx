import { ViewTransition } from "react";
import { DevelopImage } from "./DevelopImage";
import { LightboxProvider, LightboxTrigger, type LightboxLabels } from "./Lightbox";
import { Reveal } from "./Reveal";
import { RichText } from "./RichText";
import type { ImageRef } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ProjectGalleryProps {
  images: ImageRef[];
  /** Labels the region. */
  label: string;
  /** Labels for the enlarged view. */
  lightbox: LightboxLabels;
  /**
   * Pairs the first photograph with the gallery figure it was opened from,
   * so the picture carries across the page change — `project-<slug>`.
   */
  transitionName?: string;
  className?: string;
}

/**
 * Every photograph of a project, each with its caption directly beneath it.
 *
 * This replaced a large image with a rail of thumbnails, which showed one
 * caption at a time. The old site — the source of truth for project content
 * (docs/decisions/mirror-old-site-content.md) — prints a caption under every
 * picture, and that caption is often the only thing saying what the photograph
 * shows and at what stage: "Work in progress", "Completed", which segment of
 * the dam. So the gallery now shows them all, in the old site's order: the
 * first full width, the rest two to a row.
 *
 * Any photograph opens larger: the figure's picture is a button into the
 * lightbox, which steps through the set with the captions. A portrait
 * photograph sits whole inside the 3:2 frame rather than being cropped to
 * its middle third, because a caption describes the whole frame.
 */
export function ProjectGallery({
  images,
  label,
  lightbox,
  transitionName,
  className,
}: ProjectGalleryProps) {
  if (!images.length) return null;
  const [lead, ...rest] = images;

  return (
    <LightboxProvider images={images} labels={lightbox}>
      <section aria-label={label} className={cn("flex flex-col gap-10", className)}>
        <Photo
          image={lead}
          index={0}
          sizes="(min-width: 1024px) 58vw, 100vw"
          priority
          transitionName={transitionName}
        />

        {rest.length ? (
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
            {rest.map((image, position) => (
              <Reveal key={image.src} as="li" index={position % 2}>
                <Photo
                  image={image}
                  index={position + 1}
                  sizes="(min-width: 1024px) 29vw, (min-width: 640px) 50vw, 100vw"
                />
              </Reveal>
            ))}
          </ul>
        ) : null}
      </section>
    </LightboxProvider>
  );
}

function Photo({
  image,
  index,
  sizes,
  priority = false,
  transitionName,
}: {
  image: ImageRef;
  index: number;
  sizes: string;
  priority?: boolean;
  transitionName?: string;
}) {
  const portrait = (image.height ?? 0) > (image.width ?? 0);
  const box = (
    <DevelopImage
      as="span"
      image={image}
      sizes={sizes}
      priority={priority}
      develop={priority ? "load" : "view"}
      contain={portrait}
      zoom
      className="aspect-3/2 w-full"
    />
  );

  return (
    <figure className="m-0">
      <LightboxTrigger index={index}>
        {transitionName ? <ViewTransition name={transitionName}>{box}</ViewTransition> : box}
      </LightboxTrigger>
      <figcaption className="mt-3 flex items-baseline gap-3 text-sm text-steel-ink wdth-body text-pretty">
        <span aria-hidden="true" className="eyebrow tabular text-steel">
          {String(index + 1).padStart(2, "0")}
        </span>
        {image.caption ? <RichText text={image.caption} /> : null}
      </figcaption>
    </figure>
  );
}
