/**
 * Image loader for the static export.
 *
 * There is no image server, so `next/image` cannot resize anything at request
 * time. What it can do is build a `srcset` — and `scripts/optimise-images.mjs`
 * has already written two real files for every photograph: `<name>.webp` capped
 * at 1920px and `<name>-800.webp` capped at 800px.
 *
 * This maps each width `next/image` asks for onto whichever of those two files
 * is right, so a phone downloads the 800px file (~50KB) instead of the 1920px
 * one (up to 820KB). `deviceSizes` in next.config.ts is set to exactly [800,
 * 1920] so every entry in the generated srcset resolves to a file that exists.
 *
 * Anything that is not one of our generated WebPs — the logo PNGs, the Open
 * Graph card — passes through untouched.
 */
export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src.endsWith(".webp") || src.endsWith("-800.webp")) return src;
  return width <= 800 ? src.replace(/\.webp$/, "-800.webp") : src;
}
