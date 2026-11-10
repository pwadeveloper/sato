import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { ImageRef } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface DevelopImageProps {
  image: ImageRef;
  /** `sizes` for the srcset — the loader serves the 800px file below 800. */
  sizes: string;
  /**
   * How the picture arrives. `load` develops as the page paints (headers and
   * the hero, which are on screen already); `view` develops as it scrolls
   * into view; `none` is just the photograph.
   */
  develop?: "load" | "view" | "none";
  priority?: boolean;
  /** Fit inside the box rather than cover it — portrait photographs in a landscape frame. */
  contain?: boolean;
  /** Grows slightly when an ancestor `.group` is hovered. */
  zoom?: boolean;
  /** `span` where the box sits inside a button, which may only hold phrasing content. */
  as?: "div" | "span";
  /** The box: aspect ratio, background, radius. The image fills it. */
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * A photograph in a box, developing like a print.
 *
 * Every photograph on the site goes through here so they all arrive the same
 * way — see the halftone develop in globals.css. The box is `relative` and
 * the image fills it; the caller sets the aspect ratio. `focalPoint` on the
 * image becomes `object-position`, as on a page header.
 */
export function DevelopImage({
  image,
  sizes,
  develop = "view",
  priority = false,
  contain = false,
  zoom = false,
  as: Tag = "div",
  className,
  imgClassName,
  style,
  children,
}: DevelopImageProps) {
  return (
    <Tag
      data-develop={develop === "none" ? "none" : develop}
      className={cn("relative block overflow-hidden bg-steel/10", className)}
      style={style}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className={cn(
          contain ? "object-contain" : "object-cover",
          zoom && "zoom-on-hover group-hover:scale-[1.035] motion-reduce:transform-none",
          imgClassName,
        )}
        style={image.focalPoint ? { objectPosition: image.focalPoint } : undefined}
      />
      {children}
    </Tag>
  );
}
