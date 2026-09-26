import type { Site } from "./content-types";
import { hasPlaceholder, stripPlaceholders } from "./placeholders";

/**
 * Organization schema for the site root.
 *
 * Structured data is a machine-readable claim about a real company, so a field
 * is only emitted when the company has actually confirmed it. Anything still
 * carrying a `{{CONFIRM: ...}}` is left out entirely rather than published with
 * the placeholder stripped out — a half-written street address or an invented
 * registration number is worse than none at all, because a verifying reader
 * may act on it.
 *
 * No country is published. The company is extending outside its first market
 * and registering internationally, and `addressCountry` / `areaServed` would
 * pin it to one country in exactly the machine-readable place that is hardest
 * to correct later. Locality and region still identify the offices.
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
  // Offices are an ordered list with no "head office"; the first is the one
  // published as the organisation's address.
  const [head] = site.offices;

  const address = head
    ? compact({
        "@type": "PostalAddress",
        addressLocality: confirmed(head.city),
        addressRegion: confirmed(head.state),
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
          availableLanguage: "en",
        })
      : undefined;

  return compact({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: site.name,
    legalName: confirmed(site.registeredName),
    description: stripPlaceholders(site.description) || undefined,
    url: base,
    logo: `${base}/images/sato-logo-dark-text.png`,
    foundingDate: String(site.foundedYear),
    address,
    telephone,
    email,
    contactPoint: contactPoint ? [contactPoint] : undefined,
    // Held back with the rest of the registration number — see `showRcNumber`.
    identifier: site.showRcNumber ? confirmed(site.rcNumber) : undefined,
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
    inLanguage: "en",
  };
}
