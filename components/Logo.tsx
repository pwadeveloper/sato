import { cn } from "@/lib/cn";

/**
 * The supplied wordmark, art-directed by width.
 *
 * Two lockups, not one. The horizontal lockup is nearly 8:1, so at the 40px
 * the client asked for on mobile it would be 315px wide and collide with the
 * menu button at 360px. Below `md` the stacked lockup from the client's deck
 * runs instead, which reaches the same height in 102px. From `md` up there is
 * room for the horizontal one and it takes over.
 *
 * Each source declares its own intrinsic `width`/`height`, so the browser
 * reserves the right box for whichever lockup it picks and the mark never
 * shifts layout while it decodes. Only the height is ever set in CSS — the
 * width stays `auto` so neither lockup can be squashed.
 */
const SOURCES = {
  light: {
    wide: { src: "/images/sato-logo-dark-text.png", width: 2507, height: 318 },
    stacked: { src: "/images/sato-logo-stacked-dark-text.png", width: 408, height: 160 },
  },
  dark: {
    wide: { src: "/images/sato-logo-light-text.png", width: 1843, height: 229 },
    stacked: { src: "/images/sato-logo-stacked-light-text.png", width: 408, height: 160 },
  },
} as const;

/** Where the horizontal lockup takes over from the stacked one. */
const WIDE_FROM = "(min-width: 768px)";

/**
 * Header sizing. 64px on a real desktop, as asked. The 1024–1279px band drops
 * to 56px because the horizontal lockup is 504px wide at 64px and the full nav
 * needs the rest of a 1024px viewport — 56px is what fits without the bar
 * wrapping.
 */
const HEADER_SIZE = "h-10 md:h-13 lg:h-14 xl:h-16";

export interface LogoProps {
  /** The surface the mark sits on, not the colour of the mark. */
  surface?: keyof typeof SOURCES;
  alt: string;
  /** Height utilities. Never set a width — the aspect ratio is the mark's. */
  sizeClassName?: string;
  className?: string;
  /** Eager-loads and raises fetch priority. Set on the header mark only. */
  priority?: boolean;
}

export function Logo({
  surface = "light",
  alt,
  sizeClassName = HEADER_SIZE,
  className,
  priority = false,
}: LogoProps) {
  const { wide, stacked } = SOURCES[surface];

  return (
    <picture>
      <source
        media={WIDE_FROM}
        srcSet={wide.src}
        width={wide.width}
        height={wide.height}
      />
      {/* A plain <img>: next/image cannot art-direct between two lockups of
          different aspect ratios, and these are fixed-size PNGs served
          straight from /public, so there is nothing for its loader to do. */}
      <img
        src={stacked.src}
        width={stacked.width}
        height={stacked.height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={cn("w-auto max-w-full self-center", sizeClassName, className)}
      />
    </picture>
  );
}
