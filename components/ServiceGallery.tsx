import Image from "next/image";
import { Heading } from "./Heading";
import { RichText } from "./RichText";
import type { ImageRef } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ServiceGalleryProps {
  images: ImageRef[];
  heading: string;
  headingId: string;
  headingLevel?: 2 | 3;
  className?: string;
}

/**
 * Photographs of work delivered under one service.
 *
 * A plain grid, not the project gallery: these are the client's own
 * photographs of completed jobs, with no order to step through and nothing to
 * enlarge, so a rail of thumbnails and a selected image would be an
 * interaction invented for its own sake. Each picture carries its caption
 * where it has one.
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
  className,
}: ServiceGalleryProps) {
  if (!images.length) return null;



  return (
    <section aria-labelledby={headingId} className={cn(className)}>
      <Heading
        level={headingLevel}
        size={headingLevel === 2 ? "h2" : "h3"}
        text={heading}
        id={headingId}
      />

      <ul
        className={cn(
          "mt-6 grid gap-6 sm:grid-cols-2",
          images.length > 2 && "lg:grid-cols-3",
        )}
      >
        {images.map((image) => (
          <li key={image.src}>
            <figure className="m-0">
              <div className="relative aspect-3/2 w-full overflow-hidden bg-steel/10">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  loading="lazy"
                  className="object-cover"
                />
              </div>

              {image.caption ? (
                <figcaption className="mt-2 text-sm text-steel-ink wdth-body">
                  <RichText text={image.caption} />
                </figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
