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
 * Where a category heading links to, in a list that also links each service.
 *
 * Only a category with a landing page of its own. A category holding one
 * service leaves its heading as plain text and lets the row beneath carry the
 * link, so a card never holds two links to the same page.
 */
export function bandHref<T extends { slug: string }>(band: BandShape<T>): string | undefined {
  return band.href;
}

/**
 * Where a category heading links to in the nav panel, which has no rows.
 *
 * There a category of one has to be the link itself — "Energy Services" as
 * dead text above nothing is not a menu item.
 */
export function bandMenuHref<T extends { slug: string }>(
  band: BandShape<T>,
): string | undefined {
  if (band.href) return band.href;
  return band.services.length === 1 ? `/services/${band.services[0].slug}` : undefined;
}

/** The services listed beneath a heading. A category of one *is* its heading. */
export function bandItems<T extends { slug: string }>(band: BandShape<T>): T[] {
  return !band.href && band.services.length === 1 ? [] : band.services;
}
