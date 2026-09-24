"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ImageRef } from "@/lib/content-types";

export interface HeroCarouselProps {
  images: ImageRef[];
  /** Milliseconds each photograph is held. */
  interval?: number;
}

/**
 * Crossfading background for the hero.
 *
 * The photographs are decorative here — every word the hero says is in the
 * markup on top of them — so they carry empty alt text and the rotation is
 * never announced. A screen reader hearing three image descriptions cycle
 * behind a headline would be told nothing it did not already have.
 *
 * Rotation stops entirely under `prefers-reduced-motion`, which also settles
 * WCAG 2.2.2: the only moving thing on the page holds still for anyone who
 * has asked for that, and nothing is lost when it does.
 */
export function HeroCarousel({ images, interval = 7000 }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % images.length),
      interval,
    );
    return () => window.clearInterval(id);
  }, [images.length, interval]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-asphalt">
      {images.map((image, i) => (
        <Image
          key={image.src}
          src={image.src}
          alt=""
          fill
          // Only the first is part of the initial paint; the rest arrive later.
          priority={i === 0}
          loading={i === 0 ? "eager" : "lazy"}
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1200ms] ease-out motion-reduce:transition-none ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
