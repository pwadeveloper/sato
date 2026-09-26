/**
 * Presentation rules shared by every place the service categories are listed:
 * the header panel, Home, and the services overview.
 *
 * Kept free of content imports so client components can use it without
 * pulling all of `/content` into the browser bundle.
 */

export interface BandShape<T extends { slug: string }> {
  /** A landing page for the whole category, where it has one. */
  href?: string;
  services: T[];
}

/**
 * Where a category heading links to.
 *
 * Only a category with a landing page of its own — Infrastructure Services.
 * Everywhere a category is listed, **the rows are the links**: a category of
 * one leaves its heading as plain text and lets its single row carry the
 * link, so no block ever holds two links to the same page and every heading
 * means the same thing.
 */
export function bandHref<T extends { slug: string }>(band: BandShape<T>): string | undefined {
  return band.href;
}

/**
 * The services listed beneath a heading.
 *
 * A category of one is returned empty, because its row shows the service's
 * summary rather than repeating the category name that is already directly
 * above it. Callers render that row from `services[0]`.
 */
export function bandItems<T extends { slug: string }>(band: BandShape<T>): T[] {
  return !band.href && band.services.length === 1 ? [] : band.services;
}
