import type { Metadata } from "next";
import type { Page, Service, Site } from "./content-types";
import { hasPlaceholder } from "./placeholders";

/**
 * Page metadata, assembled from content JSON.
 *
 * Title, description and the Open Graph card all come from `/content` — a page
 * file holds no copy of its own. The OG image defaults to the first cleared
 * hero in `site.json`, which a page may override with its own `ogImage`.
 */
export function buildPageMetadata(page: Page, site: Site): Metadata {
  const title = page.metaTitle ?? page.title;
  const description = page.metaDescription ?? site.description;
  const image = page.ogImage ?? site.heroImages[0];
  // Home's own title is already the full company name.
  const cardTitle = title === site.name ? title : `${title} — ${site.name}`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: site.name,
      title: cardTitle,
      description,
      locale: "en_NG",
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
  const description = hasPlaceholder(service.summary) ? site.description : service.summary;

  return buildPageMetadata(
    {
      slug: `services/${service.slug}`,
      title: service.name,
      metaTitle: service.name,
      metaDescription: description,
      ogImage: service.image ?? undefined,
      sections: [],
    },
    site,
  );
}
