import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The supplied wordmark. Both files carry the green lozenge; they differ in the
 * colour of the "Engineering & Infrastructure Limited" lockup, so the variant
 * is chosen by the surface behind it.
 *
 * Intrinsic sizes are passed explicitly so the wide mark reserves its box and
 * never shifts layout while the image decodes.
 */
const SOURCES = {
  light: { src: "/images/sato-logo-dark-text.png", width: 2507, height: 318 },
  dark: { src: "/images/sato-logo-light-text.png", width: 1843, height: 229 },
} as const;

export interface LogoProps {
  /** The surface the mark sits on, not the colour of the mark. */
  surface?: keyof typeof SOURCES;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function Logo({ surface = "light", alt, className, priority = false }: LogoProps) {
  const { src, width, height } = SOURCES[surface];

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn("h-7 w-auto max-w-full self-start md:h-9", className)}
    />
  );
}
