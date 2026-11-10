"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import type { CSSProperties } from "react";
import { ScaleRule } from "../ScaleRule";
import type { ImageRef } from "@/lib/content-types";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/use-media-query";

/**
 * The shader is loaded after hydration and never on the server: it is the
 * one piece of the hero that needs WebGL, and the photograph beneath it is
 * complete without it.
 */
const DitherCanvas = dynamic(
  () => import("../webgl/DitherCanvas").then((mod) => mod.DitherCanvas),
  { ssr: false },
);

export interface HeroPhotoProps {
  image: ImageRef;
  sizes: string;
  className?: string;
}

/**
 * The home photograph, developing from the drawing.
 *
 * A normal `next/image` carries the picture — priority, in the srcset, with
 * its alt — and the WebGL layer on top plays the dither-to-photograph
 * resolve, then lets the pointer lift the drawing back out of the print. On
 * a phone the shader samples the 800px file so the picture is not fetched
 * twice at full size; on a desktop it uses the full file. Reduced motion, no
 * WebGL, or a failed texture all leave the plain photograph.
 */
export function HeroPhoto({ image, sizes, className }: HeroPhotoProps) {
  const small = useMediaQuery("(max-width: 1023px)");
  const textureSrc = small ? image.src.replace(/\.webp$/, "-800.webp") : image.src;

  return (
    /*
      Two developments on one clock. The CSS halftone grows the photograph
      from dots over 2.4s from the first paint, easing in so the dots stay
      small for most of it — that is what a reader sees before the shader is
      ready, and all a reader without WebGL sees. The mask is on the image
      alone, so the shader, which covers it once it arrives, is never seen
      through the dots. The shader joins on the page clock: full dither until
      0.9s, then the resolve, finishing as the CSS does.
    */
    <div className={cn("relative overflow-hidden bg-steel/10", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        sizes={sizes}
        data-develop="load"
        className="object-cover"
        style={{
          ...(image.focalPoint ? { objectPosition: image.focalPoint } : {}),
          "--develop-duration": "2400ms",
          "--develop-ease": "cubic-bezier(0.5, 0, 0.75, 0)",
          "--develop-from": "1.2px",
        } as CSSProperties}
      />
      <DitherCanvas src={textureSrc} resolveAtMs={900} resolveDurationMs={1500} />
      <ScaleRule className="absolute inset-x-0 bottom-0 z-10 rotate-180 text-concrete/80" />
    </div>
  );
}
