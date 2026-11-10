import { DevelopImage } from "./DevelopImage";
import { Heading } from "./Heading";
import { LightboxProvider, LightboxTrigger, type LightboxLabels } from "./Lightbox";
import { Reveal } from "./Reveal";
import { RichText } from "./RichText";
import type { ImageRef } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ServiceGalleryProps {
  images: ImageRef[];
  heading: string;
  headingId: string;
  headingLevel?: 2 | 3;
  /** Labels for the enlarged view. Without them the pictures do not open. */
  lightbox?: LightboxLabels;
  className?: string;
}

/**
 * Photographs of work delivered under one service.
 *
 * A plain grid, not the project gallery: these are the client's own
 * photographs of completed jobs, with no order to step through and nothing to
 * enlarge, so a rail of thumbnails and a selected image would be an
 * interaction invented for its own sake. Each picture carries its caption
 * where it has one, and opens larger where the page has supplied the labels.
 *
 * Renders nothing when there are no images, which is the normal state — the
 * `images` array on a service is empty until the client sends photographs for
 * it. See docs/adding-client-photos.md.
 */
export function ServiceGallery({
  images,
  heading,
  headingId,
  headingLevel = 2,
  lightbox,
  className,
}: ServiceGalleryProps) {
  if (!images.length) return null;

  const grid = (
    <ul
      className={cn(
        "mt-6 grid gap-6 sm:grid-cols-2",
        /* Four sit 2×2: three columns would leave one alone on a row. */
        images.length > 2 && images.length !== 4 && "lg:grid-cols-3",
      )}
    >
      {images.map((image, index) => {
        const box = (
          <DevelopImage
            as="span"
            image={image}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            zoom={Boolean(lightbox)}
            className="aspect-3/2 w-full"
          />
        );
        return (
          <Reveal key={image.src} as="li" index={index % 3}>
            <figure className="m-0">
              {lightbox ? <LightboxTrigger index={index}>{box}</LightboxTrigger> : box}
              {image.caption ? (
                <figcaption className="mt-3 text-sm text-steel-ink wdth-body">
                  <RichText text={image.caption} />
                </figcaption>
              ) : null}
            </figure>
          </Reveal>
        );
      })}
    </ul>
  );

  return (
    <section aria-labelledby={headingId} className={cn(className)}>
      <Heading
        level={headingLevel}
        size={headingLevel === 2 ? "h2" : "h3"}
        text={heading}
        id={headingId}
      />
      {lightbox ? (
        <LightboxProvider images={images} labels={lightbox}>
          {grid}
        </LightboxProvider>
      ) : (
        grid
      )}
    </section>
  );
}
