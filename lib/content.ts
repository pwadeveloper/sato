/**
 * Typed loaders for everything in `/content`.
 *
 * Components never import JSON directly and never contain copy. They receive
 * content through these functions, which is what lets Phase 2 swap the JSON
 * files for a CMS without touching the components.
 */
import siteJson from "@/content/site.json";
import servicesJson from "@/content/services.json";
import projectsJson from "@/content/projects.json";
import clientsJson from "@/content/clients.json";
import teamJson from "@/content/team.json";
import equipmentJson from "@/content/equipment.json";

import aboutPageJson from "@/content/pages/about.json";
import clientsPageJson from "@/content/pages/clients.json";
import contactPageJson from "@/content/pages/contact.json";
import homePageJson from "@/content/pages/home.json";
import notFoundPageJson from "@/content/pages/not-found.json";
import infrastructurePageJson from "@/content/pages/infrastructure.json";
import leadershipPageJson from "@/content/pages/leadership.json";
import projectsPageJson from "@/content/pages/projects.json";
import servicesPageJson from "@/content/pages/services.json";

import type {
  Client,
  CollectionFacet,
  CompanyFact,
  Equipment,
  Page,
  PageSection,
  Project,
  Service,
  ServiceBand,
  ServiceGroup,
  Site,
  TeamMember,
} from "./content-types";

/**
 * JSON imports widen string literals, so a discriminated union like
 * `PageSection` cannot be inferred from the file. The interfaces in
 * `content-types.ts` are the contract; this cast is where it is applied.
 */
function typed<T>(value: unknown): T {
  return value as T;
}

const site = typed<Site>(siteJson);

const services = typed<Service[]>(servicesJson)
  .slice()
  .sort((a, b) => a.order - b.order);

const projects = typed<Project[]>(projectsJson);
const clients = typed<Client[]>(clientsJson);

/**
 * Unpublished people are dropped at the loader, so nothing downstream — page,
 * sitemap or structured data — can render someone Sato has not confirmed.
 */
const team = typed<TeamMember[]>(teamJson)
  .filter((member) => member.published)
  .slice()
  .sort((a, b) => a.order - b.order);

const equipment = typed<Equipment[]>(equipmentJson);

/**
 * Every routed page's content.
 *
 * `pages/hse.json` is deliberately absent: HSE is on hold until Sato and its
 * oil and gas collaborator have reviewed it, so the page is not built, not
 * linked and not in the sitemap. The content file stays on disk, rewritten and
 * ready — restoring the page means re-registering it here, adding the route
 * back and dropping the /hse redirect.
 */
const pages: Record<string, Page> = {
  home: typed<Page>(homePageJson),
  about: typed<Page>(aboutPageJson),
  services: typed<Page>(servicesPageJson),
  infrastructure: typed<Page>(infrastructurePageJson),
  projects: typed<Page>(projectsPageJson),
  clients: typed<Page>(clientsPageJson),
  leadership: typed<Page>(leadershipPageJson),
  contact: typed<Page>(contactPageJson),
  "not-found": typed<Page>(notFoundPageJson),
};

/* ------------------------------------------------------------------ site */

export function getSite(): Site {
  return site;
}

/** Years in operation, derived from the founding year at build time. */
export function getYearsInOperation(): number {
  return new Date().getFullYear() - site.foundedYear;
}

/**
 * The "Company at a glance" rows, assembled from site.json.
 *
 * This panel is what a procurement officer came to check, so a row appears
 * only when there is something confirmed to put in it. The RC number is held
 * back behind `showRcNumber` rather than deleted: the company is registering
 * outside its first market, and a single national registration number on
 * every page works against that.
 */
export function getCompanyFacts(): CompanyFact[] {
  const labels = site.factLabels;
  const professional = site.registrations.find(
    (group) => group.id === "professional",
  );

  const facts: CompanyFact[] = [
    { id: "registeredName", label: labels.registeredName, value: site.registeredName },
    { id: "incorporated", label: labels.incorporated, value: String(site.foundedYear) },
    {
      id: "yearsInOperation",
      label: labels.yearsInOperation,
      value: String(getYearsInOperation()),
      note: site.anniversaryNote,
    },
  ];

  if (site.showRcNumber && site.rcNumber) {
    facts.push({ id: "rcNumber", label: labels.rcNumber, value: site.rcNumber });
  }

  if (site.offices.length) {
    facts.push({
      id: "offices",
      label: labels.offices,
      value: site.offices.map((office) => office.city).join(" · "),
    });
  }

  if (professional?.items.length) {
    facts.push({
      id: "registrations",
      label: labels.registrations,
      value: professional.items.join("; "),
    });
  }

  return facts;
}

/* ----------------------------------------------------------------- pages */

export function getPage(slug: string): Page {
  const page = pages[slug];
  if (!page) {
    throw new Error(`No page content for slug "${slug}" in /content/pages.`);
  }
  return page;
}

export function getPageSlugs(): string[] {
  return Object.keys(pages);
}

/**
 * Looks up one section of a page by id.
 *
 * Pages compose bespoke layouts rather than rendering a generic section list,
 * but every string still comes out of the JSON — this is how they reach it.
 * Throws rather than rendering an empty block if the content is renamed.
 */
export function getSection<T extends PageSection["type"]>(
  page: Page,
  id: string,
  type: T,
): Extract<PageSection, { type: T }> {
  const section = page.sections.find((item) => item.id === id);
  if (!section) {
    throw new Error(`No section "${id}" in /content/pages/${page.slug}.json.`);
  }
  if (section.type !== type) {
    throw new Error(
      `Section "${id}" in ${page.slug}.json is "${section.type}", expected "${type}".`,
    );
  }
  return section as Extract<PageSection, { type: T }>;
}

/* -------------------------------------------------------------- services */

export function getServices(): Service[] {
  return services;
}

/** The order categories are presented in, everywhere on the site. */
const BAND_ORDER: ServiceGroup[] = ["infrastructure", "energy", "oil-gas", "technology"];

/** `oil-gas` -> `groupOilGas`, so a category's copy is found by its value. */
function bandKey(group: ServiceGroup): string {
  const camel = group.replace(/-(.)/g, (_, char: string) => char.toUpperCase());
  return `group${camel[0].toUpperCase()}${camel.slice(1)}`;
}

/**
 * The service categories, with their copy resolved, in display order.
 *
 * The header, Home and the services overview all render the same four
 * categories, so the label, intro and landing-page link are resolved once
 * here from `pages/services.json` rather than re-derived at each call site.
 * A category with no services is dropped, which is what lets a future split
 * of Technology be a content edit.
 */
export function getServiceBands(): ServiceBand[] {
  const labels = pages.services.labels ?? {};

  return BAND_ORDER.map((group) => {
    const key = bandKey(group);
    return {
      group,
      label: labels[key] ?? group,
      intro: labels[`${key}Intro`] ?? "",
      href: labels[`${key}Href`] || undefined,
      services: services.filter((service) => service.group === group),
    };
  }).filter((band) => band.services.length > 0);
}

/** Divisions whose copy Sato has not yet approved. Blocks a production build. */
export function getDraftServices(): Service[] {
  return services.filter((service) => service.reviewStatus === "draft");
}

export function getService(slug: string): Service {
  const service = services.find((item) => item.slug === slug);
  if (!service) {
    throw new Error(`No service with slug "${slug}" in /content/services.json.`);
  }
  return service;
}

/* -------------------------------------------------------------- projects */

export function getProjects(): Project[] {
  return projects;
}

/**
 * True only for a project the company has confirmed as finished.
 *
 * The site never labels work "ongoing" or "in progress" (docs/site-content.md),
 * and an unresolved `{{CONFIRM: status}}` is not a claim, so both render no
 * badge at all rather than a hedge.
 */
export function isCompleted(status: string): boolean {
  return status.trim().toLowerCase() === "completed";
}

/** Projects flagged for the Home strip, in `projects.json` order. */
export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured);
}

export function getProject(slug: string): Project {
  const project = projects.find((item) => item.slug === slug);
  if (!project) {
    throw new Error(`No project with slug "${slug}" in /content/projects.json.`);
  }
  return project;
}

/**
 * The division a project belongs to.
 *
 * A service claiming the project in `relatedProjectSlugs` wins; otherwise the
 * project's sector facet names the owning division. Returns `undefined` when
 * neither is set, and the detail page then shows no division link.
 */
export function getServiceForProject(
  project: Project,
  facets: CollectionFacet[] = [],
): Service | undefined {
  const claimed = services.find((service) =>
    service.relatedProjectSlugs.includes(project.slug),
  );
  if (claimed) return claimed;

  const slug = flattenFacets(facets).find(
    (facet) => facet.value === project.sector,
  )?.serviceSlug;
  return slug ? services.find((service) => service.slug === slug) : undefined;
}

/**
 * Facets and their sub-filters as one flat list.
 *
 * The project index nests sectors under a service category, but sector
 * lookups — a project's own label, the division it links on to — care only
 * about the leaves.
 */
export function flattenFacets(facets: CollectionFacet[]): CollectionFacet[] {
  return facets.flatMap((facet) => [facet, ...flattenFacets(facet.children ?? [])]);
}

/** True when the project's sector is this facet's own, or one of its children. */
export function facetMatches(facet: CollectionFacet, sector: string): boolean {
  return flattenFacets([facet]).some((leaf) => leaf.value === sector);
}

/* --------------------------------------------------------------- clients */

export function getClients(): Client[] {
  return clients;
}

/** Clients flagged for the Home strip, in `clients.json` order. */
export function getFeaturedClients(): Client[] {
  return clients.filter((client) => client.featured);
}

/* ------------------------------------------------------------------ team */

export function getTeam(): TeamMember[] {
  return team;
}

/* ------------------------------------------------------------- equipment */

export function getEquipment(): Equipment[] {
  return equipment;
}
