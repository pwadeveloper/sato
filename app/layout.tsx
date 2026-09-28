import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { ReviewBanner } from "@/components/DraftNotice";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  getPage,
  getProjectCategories,
  getServiceBands,
  getSite,
} from "@/lib/content";
import { bandHref, bandItems } from "@/lib/service-band";
import type { HeaderMenu } from "@/components/SiteHeader";
import { isReviewMode } from "@/lib/review-mode";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/structured-data";
import "./globals.css";

/**
 * One family. `wdth` is loaded as a variable axis so headings can use the
 * expanded widths without a second file. Self-hosted by next/font, so the
 * static export makes no third-party font request.
 */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

const site = getSite();
const servicesPage = getPage("services");
const projectsPage = getPage("projects");

/**
 * The two nav panels, flattened to labels and hrefs.
 *
 * Only this crosses to the client. The header is interactive — it is the one
 * place on the site that has to be — so anything it receives ships to the
 * browser, and `getServiceBands()` carries whole service records.
 *
 * Both panels are built from the same content the pages use, so a service
 * renamed in `services.json` is renamed in the menu, and a category added to
 * `pages/projects.json` appears in it.
 */
const menus: HeaderMenu[] = [
  {
    href: "/services",
    overviewLabel: servicesPage.labels?.allServices ?? servicesPage.title,
    groups: getServiceBands().map((band) => {
      const items = bandItems(band);
      const solo = items.length === 0 ? band.services[0] : undefined;

      return {
        id: band.group,
        label: band.label,
        href: bandHref(band),
        // A category of several lists its services; a category of one lists
        // the sections of its own page, where it has any. Oil & Gas is the
        // only page long enough to declare them.
        items: items.length
          ? items.map((service) => ({
              label: service.name,
              href: `/services/${service.slug}`,
            }))
          : (solo?.sectionNav ?? []).map((section) => ({
              label: section.label,
              // A section that has moved off the page carries its own href —
              // Oil & Gas "Projects" now points at /projects/oil-gas.
              href: section.href ?? `/services/${solo?.slug}#${section.id}`,
            })),
      };
    }),
  },
  {
    href: "/projects",
    overviewLabel: projectsPage.labels?.allProjects ?? projectsPage.title,
    groups: getProjectCategories().map((category) => ({
      id: category.value,
      label: category.label,
      href: `/projects/${category.slug}`,
    })),
  },
];

/**
 * Emitted once, in the root layout, so every page carries it. Fields the
 * company has not confirmed are omitted — see `buildOrganizationSchema`.
 */
const schema = [buildOrganizationSchema(site), buildWebsiteSchema(site)];

export const metadata: Metadata = {
  // Relative image paths in page metadata resolve against this.
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s — ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="min-h-dvh bg-concrete text-asphalt antialiased">
        <script
          type="application/ld+json"
          // Built from content JSON at build time; no user input reaches it.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        {isReviewMode ? <ReviewBanner /> : null}
        <SiteHeader
          logoAlt={site.logoAlt}
          navLabel={site.navLabel}
          nav={site.nav}
          skipLinkLabel={site.skipLinkLabel}
          menuOpenLabel={site.menuOpenLabel}
          menuCloseLabel={site.menuCloseLabel}
          menus={menus}
        />
        <main id="main">{children}</main>
        <SiteFooter site={site} year={new Date().getFullYear()} />
      </body>
    </html>
  );
}
