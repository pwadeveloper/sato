import type { Site } from "./content-types";
import { hasPlaceholder, stripPlaceholders } from "./placeholders";

/**
 * Organization schema for the site root.
 *
 * Structured data is a machine-readable claim about a real company, so a field
 * is only emitted when the company has actually confirmed it. Anything still
 * carrying a `{{CONFIRM: ...}}` is left out entirely rather than published with
 * the placeholder stripped out — a half-written street address or an invented
 * RC number is worse than no address and no RC number, because a verifying
 * reader may act on it.
 *
 * The exception is text where the placeholder is an aside rather than the
 * substance (`"Abeokuta, Ogun State {{CONFIRM: full street address}}"` is a
 * real locality plus a request for more detail), and those fields are built
 * from their own confirmed parts instead — `city` and `state` here.
 */

/** The value if it is fully confirmed, otherwise undefined. */
function confirmed(value: string | undefined): string | undefined {
  if (!value || hasPlaceholder(value)) return undefined;
  return value.trim() || undefined;
}

/** Drops undefined entries so nothing serialises as `null`. */
function compact<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export function buildOrganizationSchema(site: Site): Record<string, unknown> {
  const base = site.url.replace(/\/+$/, "");
  const head = site.offices.find((office) => office.isPrimary) ?? site.offices[0];

  const address = head
    ? compact({
        "@type": "PostalAddress",
        addressLocality: confirmed(head.city),
        addressRegion: confirmed(head.state),
        addressCountry: "NG",
      })
    : undefined;

  const telephone = confirmed(site.phones.find((phone) => phone.value)?.value);
  const email = confirmed(site.emails.find((entry) => entry.value)?.value);

  const contactPoint =
    telephone || email
      ? compact({
          "@type": "ContactPoint",
          contactType: "sales",
          telephone,
          email,
          areaServed: "NG",
          availableLanguage: "en",
        })
      : undefined;

  return compact({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: site.name,
    // The registered name still carries a placeholder about its exact wording,
    // so only the confirmed trading name is published as `legalName`.
    legalName: confirmed(site.registeredName),
    alternateName: confirmed(site.formerName),
    description: stripPlaceholders(site.description) || undefined,
    url: base,
    logo: `${base}/images/sato-logo-dark-text.png`,
    foundingDate: String(site.foundedYear),
    address,
    telephone,
    email,
    contactPoint: contactPoint ? [contactPoint] : undefined,
    // Only emitted once the CAC number is confirmed.
    identifier: confirmed(site.rcNumber),
    areaServed: { "@type": "Country", name: "Nigeria" },
  });
}

/** Website schema, so search engines associate the name with the domain. */
export function buildWebsiteSchema(site: Site): Record<string, unknown> {
  const base = site.url.replace(/\/+$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: site.name,
    url: base,
    publisher: { "@id": `${base}/#organization` },
    inLanguage: "en-NG",
  };
}
