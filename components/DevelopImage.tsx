import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { ImageRef } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface DevelopImageProps {
  image: ImageRef;
  sizes: string;
  /**
   * How the frame arrives. `load` and `view` both wipe it open from the
   * bottom (GSAP, in `MotionRuntime`) — on load for a header already on
   * screen, on scroll otherwise; `none` is just the photograph.
   */
  develop?: "load" | "view" | "none";
  /** The picture drifts inside its frame against the scroll. */
  parallax?: boolean;
  priority?: boolean;
  /** Fit inside the box rather than cover it — portraits in a landscape frame. */
  contain?: boolean;
  /** Grows slightly when an ancestor `.group` is hovered. */
  zoom?: boolean;
  as?: "div" | "span";
  /** The box: aspect ratio and size. The image fills it. */
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * A photograph in a frame. Every photograph on the site goes through here so
 * they all arrive the same way: the frame wipes open and the picture settles
 * from a slight zoom. `focalPoint` on the image becomes `object-position`.
 */
export function DevelopImage({
  image,
  sizes,
  develop = "view",
  parallax = false,
  priority = false,
  contain = false,
  zoom = false,
  as: Tag = "div",
  className,
  imgClassName,
  style,
  children,
}: DevelopImageProps) {
  const img = (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      className={cn(
        contain ? "object-contain" : "object-cover",
        zoom && !parallax && "zoom-on-hover group-hover:scale-[1.04] motion-reduce:transform-none",
        imgClassName,
      )}
      style={image.focalPoint ? { objectPosition: image.focalPoint } : undefined}
    />
  );

  return (
    <Tag
      data-anim={develop === "none" ? undefined : "image"}
      className={cn("relative block overflow-hidden rounded-(--radius-frame) bg-rule/60", className)}
      style={style}
    >
      {parallax ? (
        <span data-anim="parallax" className="absolute inset-0 block">
          {img}
        </span>
      ) : (
        img
      )}
      {children}
    </Tag>
  );
}
