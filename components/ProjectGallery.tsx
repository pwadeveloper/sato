import Image from "next/image";
import type { ImageRef } from "@/lib/content-types";
import { cn } from "@/lib/cn";
import { RichText } from "./RichText";

export interface ProjectGalleryProps {
  images: ImageRef[];
  /** Labels the region. */
  label: string;
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
 * Nothing here needs JavaScript. A portrait photograph sits whole inside the
 * 3:2 frame rather than being cropped to its middle third, because a caption
 * describes the whole frame.
 */
export function ProjectGallery({ images, label, className }: ProjectGalleryProps) {
  if (!images.length) return null;
  const [lead, ...rest] = images;

  return (
    <section aria-label={label} className={cn("flex flex-col gap-8", className)}>
      <Photo image={lead} sizes="(min-width: 1024px) 58vw, 100vw" priority />

      {rest.length ? (
        <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
          {rest.map((image) => (
            <li key={image.src}>
              <Photo image={image} sizes="(min-width: 1024px) 29vw, (min-width: 640px) 50vw, 100vw" />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function Photo({
  image,
  sizes,
  priority = false,
}: {
  image: ImageRef;
  sizes: string;
  priority?: boolean;
}) {
  const portrait = (image.height ?? 0) > (image.width ?? 0);

  return (
    <figure className="m-0">
      <div className="relative aspect-3/2 w-full overflow-hidden bg-steel/10">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          sizes={sizes}
          className={portrait ? "object-contain" : "object-cover"}
        />
      </div>
      {image.caption ? (
        <figcaption className="mt-2 text-sm text-steel-ink wdth-body text-pretty">
          <RichText text={image.caption} />
        </figcaption>
      ) : null}
    </figure>
  );
}
