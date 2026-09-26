import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPage, getServiceGroups, getSite } from "@/lib/content";
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

/** Only what the header needs crosses to the client. */
const serviceBands = getServiceGroups().map(({ group, services }) => ({
  group,
  label:
    servicesPage.labels?.[`group${group[0].toUpperCase()}${group.slice(1)}`] ?? group,
  services: services.map((s) => ({ slug: s.slug, name: s.name })),
}));

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
    <html lang="en-NG" className={archivo.variable}>
      <body className="min-h-dvh bg-concrete text-asphalt antialiased">
        <script
          type="application/ld+json"
          // Built from content JSON at build time; no user input reaches it.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <SiteHeader
          logoAlt={site.logoAlt}
          navLabel={site.navLabel}
          nav={site.nav}
          skipLinkLabel={site.skipLinkLabel}
          menuOpenLabel={site.menuOpenLabel}
          menuCloseLabel={site.menuCloseLabel}
          serviceBands={serviceBands}
        />
        <main id="main">{children}</main>
        <SiteFooter site={site} year={new Date().getFullYear()} />
      </body>
    </html>
  );
}
