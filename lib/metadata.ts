import type { Metadata } from "next";
import type { Page, Service, Site } from "./content-types";
import { stripPlaceholders } from "./placeholders";

/**
 * Page metadata, assembled from content JSON.
 *
 * Title, description and the Open Graph card all come from `/content` — a page
 * file holds no copy of its own. The OG image defaults to the first cleared
 * hero in `site.json`, which a page may override with its own `ogImage`.
 */
/** Absolute canonical for a page slug. "" is the home page. */
export function canonicalPath(slug: string): string {
  if (!slug || slug === "home") return "/";
  return `/${slug.replace(/^\/+|\/+$/g, "")}`;
}

export function buildPageMetadata(page: Page, site: Site): Metadata {
  // Metadata is published to search results and link previews, so an
  // unresolved placeholder must never reach it — it is stripped here rather
  // than at each call site. The page body still shows it, highlighted.
  const title = stripPlaceholders(page.metaTitle ?? page.title) || site.name;
  const description =
    stripPlaceholders(page.metaDescription ?? site.description) || site.description;
  const image = page.ogImage ?? site.ogImage;
  const path = canonicalPath(page.slug);
  // Home's own title is already the full company name.
  const cardTitle = title === site.name ? title : `${title} — ${site.name}`;

  return {
    // The root layout appends "— <company>", so a title that already IS the
    // company name (a page whose own title was nothing but a placeholder)
    // opts out of the template rather than saying it twice.
    title: title === site.name ? { absolute: title } : title,
    description,
    // One canonical per page, absolute against `metadataBase` in the layout.
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      url: path,
      title: cardTitle,
      description,
      images: image
        ? [{ url: image.src, width: image.width, height: image.height, alt: image.alt }]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: cardTitle,
      description,
      images: image ? [image.src] : undefined,
    },
  };
}

/**
 * Service division metadata. Routed through `buildPageMetadata` so a division
 * card is assembled exactly like a page's.
 *
 * An unconfirmed summary is not shipped as a description — the energy division
 * has no confirmed copy yet, and `{{CONFIRM: ...}}` is not a sentence to hand
 * to a search engine or a link preview.
 */
export function buildServiceMetadata(service: Service, site: Site): Metadata {
  return buildPageMetadata(
    {
      slug: `services/${service.slug}`,
      title: service.name,
      metaTitle: service.name,
      metaDescription: service.summary,
      ogImage: service.image ?? undefined,
      sections: [],
    },
    site,
  );
}
