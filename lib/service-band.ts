/**
 * Presentation rules shared by every place the service categories are listed:
 * the header panel and the services overview.
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
 * Every heading is a destination — the client's instruction, and the right
 * one: a heading that looks like the name of a service and does nothing when
 * clicked is a dead end. A category with a landing page goes there; a
 * category of one goes straight to its single service, because that service
 * *is* the category. Only a multi-service category with no landing page
 * would return nothing, and none exists.
 */
export function bandHref<T extends { slug: string }>(
  band: BandShape<T>,
): string | undefined {
  if (band.href) return band.href;
  return band.services.length === 1
    ? `/services/${band.services[0].slug}`
    : undefined;
}

/**
 * The services listed beneath a heading.
 *
 * A category of one is returned empty: its heading already links to it, and
 * repeating the name underneath would be the same word twice.
 */
export function bandItems<T extends { slug: string }>(band: BandShape<T>): T[] {
  return !band.href && band.services.length === 1 ? [] : band.services;
}
