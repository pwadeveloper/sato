import type { Metadata } from "next";
import localFont from "next/font/local";
import { ViewTransition } from "react";
import { ReviewBanner } from "@/components/DraftNotice";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { MotionRuntime } from "@/components/motion/MotionRuntime";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  getPage,
  getProjectBands,
  getServiceBands,
  getServiceNav,
  getSite,
} from "@/lib/content";
import { bandHref, bandItems } from "@/lib/service-band";
import type { HeaderMenu } from "@/components/SiteHeader";
import type { Service, ServiceSection } from "@/lib/content-types";
import { isReviewMode } from "@/lib/review-mode";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/structured-data";
import "./globals.css";

/**
 * Three families, self-hosted from `app/fonts` (Geist from Vercel's `geist`
 * package, Instrument Serif from Fontsource; both SIL Open Font License), so
 * neither the build nor a visitor makes a third-party font request:
 * Instrument Serif for display, Geist for text, Geist Mono for labels.
 */
const instrument = localFont({
  src: [
    { path: "./fonts/InstrumentSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic" },
  ],
  display: "swap",
  variable: "--font-instrument",
});

const geist = localFont({
  src: "./fonts/Geist-Variable.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-geist",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-geist-mono",
});

/**
 * Sets `html.motion` before the first paint, unless the reader has asked for
 * reduced motion. CSS hides what GSAP will bring in only under that class, so
 * a reader who never runs the motion layer never sees anything hidden.
 */
const MOTION_FLAG = `if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("motion")}`;

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
/**
 * A service's page sections, for the menu — and only where it asks for them.
 *
 * Every service page now has the same three sections, so listing them under
 * every category would print the same two or three generic words four times
 * in one dropdown, telling the reader nothing they do not get from the page
 * being a service page. `showSectionsInMenu` is how a service opts in, and
 * Oil & Gas is the only one that does: its page is long enough that reaching
 * a section from the menu saves a scroll.
 *
 * A section carrying an `href` is left out even then. Oil & Gas "Projects"
 * is `/projects/oil-gas`, which Projects lists under its own top-level nav
 * item, and one destination in two menus was the duplication the client
 * asked us to remove. The in-page sub-nav still shows it — on that page the
 * reader is looking for the section, not for a menu.
 */
function onPageSections(service: Service | undefined): ServiceSection[] {
  if (!service?.showSectionsInMenu) return [];
  return getServiceNav(service).filter((section) => !section.href);
}

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
        // the sections of its own page, where it has asked for them. Oil &
        // Gas is the only page long enough to.
        items: items.length
          ? items.map((service) => ({
              label: service.name,
              href: `/services/${service.slug}`,
            }))
          : onPageSections(solo).map((section) => ({
              label: section.label,
              href: `/services/${solo?.slug}#${section.id}`,
            })),
      };
    }),
  },
  {
    href: "/projects",
    overviewLabel: projectsPage.labels?.allProjects ?? projectsPage.title,
    /**
     * Grouped exactly like Services: "Infrastructure Services" as a heading
     * with its disciplines indented, then the other categories at the top
     * level. A band of one is rendered as its own category rather than as a
     * heading above one repeated name, and a category with no projects is not
     * in the list at all.
     *
     * The Infrastructure heading is not a link: there is no
     * `/projects/infrastructure`, and a heading that looks like a destination
     * and is not one is worse than a plain heading.
     */
    groups: getProjectBands().map((band) => {
      const solo =
        band.categories.length === 1 && band.label === band.categories[0].label
          ? band.categories[0]
          : undefined;

      return solo
        ? { id: solo.value, label: solo.label, href: `/projects/${solo.slug}` }
        : {
            id: band.group,
            label: band.label,
            items: band.categories.map((category) => ({
              label: category.label,
              href: `/projects/${category.slug}`,
            })),
          };
    }),
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
    <html
      lang="en"
      className={`${instrument.variable} ${geist.variable} ${geistMono.variable}`}
      // The motion flag is added by the inline script before hydration.
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-concrete text-asphalt antialiased">
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG }} />
        <script
          type="application/ld+json"
          // Built from content JSON at build time; no user input reaches it.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <MotionProvider>
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
          {/*
            Route changes crossfade, and a photograph that carries from a
            gallery to its project page morphs between the two — React's
            ViewTransition names the pairs, globals.css sets the timing, and
            a browser without the API simply swaps pages as before.
          */}
          <main id="main">
            <ViewTransition>{children}</ViewTransition>
          </main>
          <SiteFooter site={site} year={new Date().getFullYear()} />
          <MotionRuntime />
        </MotionProvider>
      </body>
    </html>
  );
}
