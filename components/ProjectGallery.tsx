"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { ImageRef } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ProjectGalleryProps {
  images: ImageRef[];
  /** Labels the region. */
  label: string;
  /** Labels the thumbnail rail. */
  thumbsLabel: string;
  className?: string;
}

/**
 * One large photograph with a rail of thumbnails under it.
 *
 * No lightbox and no library: the thumbnails are plain buttons, so they are in
 * the tab order and work with Enter or Space for free, and arrow keys move
 * along the rail the way a radio group does. With scripting off the first
 * photograph and the whole rail are still rendered, so every image is visible
 * — smaller, but nothing is hidden behind an interaction that cannot happen.
 */
export function ProjectGallery({
  images,
  label,
  thumbsLabel,
  className,
}: ProjectGalleryProps) {
  const [index, setIndex] = useState(0);
  const rail = useRef<HTMLDivElement>(null);

  if (!images.length) return null;

  const active = images[index] ?? images[0];
  const single = images.length === 1;

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + images.length) % images.length;
    setIndex(next);
    rail.current
      ?.querySelectorAll<HTMLButtonElement>("button")
      [next]?.focus();
  };

  return (
    <figure className={cn("m-0", className)} aria-label={label}>
      <div className="relative aspect-3/2 w-full overflow-hidden bg-steel/10">
        <Image
          key={active.src}
          src={active.src}
          alt={active.alt}
          fill
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover"
        />
      </div>

      {single ? null : (
        <div
          ref={rail}
          role="group"
          aria-label={thumbsLabel}
          onKeyDown={onKeyDown}
          className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8"
        >
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              aria-current={i === index ? "true" : undefined}
              // The rail duplicates the main image, so the accessible name is
              // the action, not a second reading of the same alt text.
              aria-label={image.alt}
              onClick={() => setIndex(i)}
              className={cn(
                "relative aspect-3/2 overflow-hidden bg-steel/10 transition-opacity duration-150",
                i === index
                  ? "outline-2 outline-offset-2 outline-asphalt"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 10vw, 25vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {active.caption ? (
        <figcaption className="mt-3 text-xs text-steel-ink wdth-body">
          {active.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
