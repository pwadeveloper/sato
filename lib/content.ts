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
  PartnerBlock,
  Project,
  ProjectBand,
  ProjectGroup,
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
const BAND_ORDER: ServiceGroup[] = [
  "infrastructure",
  "energy",
  "oil-gas",
  "digital-twin",
  "research-innovation",
];

/** `oil-gas` -> `groupOilGas`, so a category's copy is found by its value. */
function bandKey(group: ServiceGroup): string {
  const camel = group.replace(/-(.)/g, (_, char: string) => char.toUpperCase());
  return `group${camel[0].toUpperCase()}${camel.slice(1)}`;
}

/**
 * The service categories, with their copy resolved, in display order.
 *
 * The header, the services overview and the service pages all render the
 * same five categories, so the label, intro, photograph and landing-page
 * link are resolved once here from `pages/services.json` rather than
 * re-derived at each call site. A category with no services is dropped —
 * which is how splitting Technology into two was a content edit.
 *
 * A category of one takes its photograph from its single service, because
 * that service *is* the category; only Infrastructure, which holds four,
 * needs a picture of its own.
 */
export function getServiceBands(): ServiceBand[] {
  const labels = pages.services.labels ?? {};
  const images = pages.services.images ?? {};

  return BAND_ORDER.map((group) => {
    const key = bandKey(group);
    const members = services.filter((service) => service.group === group);
    return {
      group,
      label: labels[key] ?? group,
      intro: labels[`${key}Intro`] ?? "",
      href: labels[`${key}Href`] || undefined,
      image: images[key] ?? members[0]?.image ?? undefined,
      services: members,
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
 * The project categories, in display order, from `pages/projects.json`.
 *
 * There is one category per service, named and ordered exactly as the
 * services are: the client asked for Projects to mirror Services, so someone
 * who has found the Electrical Engineering service knows without being told
 * where its projects are. A category is a leaf — one route, one photograph.
 *
 * Only a category that actually has projects is returned. That is what keeps
 * the eight from being eight, four of which would be an empty page: Mechanical
 * Engineering, Energy, Digital Twin and Research have no projects yet, so they
 * are absent from the dropdown, the landing page and the sitemap, and each
 * appears the moment its first project lands in `projects.json`.
 */
export function getProjectCategories(): CollectionFacet[] {
  const section = getSection(pages.projects, "all-projects", "collection");
  return (section.facets ?? []).filter((facet) => getProjectCount(facet) > 0);
}

/**
 * The visible project categories grouped into the service categories, in the
 * same order the services use.
 *
 * This is what makes the Projects dropdown and landing page read like the
 * Services ones: the Infrastructure disciplines indented under one heading,
 * then Energy, Oil & Gas, Digital Twin and Research at the top level. A band
 * whose categories are all empty drops out with them.
 *
 * The labels are the service categories' own, from `pages/services.json`, so
 * the two menus cannot drift apart.
 */
export function getProjectBands(): ProjectBand[] {
  const categories = getProjectCategories();
  const labels = pages.services.labels ?? {};

  return BAND_ORDER.map((group) => {
    const key = bandKey(group);
    return {
      group,
      label: labels[key] ?? group,
      categories: categories.filter((category) => category.group === group),
    };
  }).filter((band) => band.categories.length > 0);
}

/**
 * The service a partner-sourced category takes its record from.
 *
 * Oil & Gas is a category of projects whose rows live on the service rather
 * than in `projects.json`: they are client/project/year records with no
 * scope, no photographs and no detail page of their own. Pointing the
 * category at the service keeps that table in one file instead of copying
 * twenty-six rows into a second one, and it is what puts the category behind
 * the same review gate as the service.
 */
export function getPartnerCategoryService(
  facet: CollectionFacet,
): Service | undefined {
  if (facet.source !== "partner" || !facet.serviceSlug) return undefined;
  return services.find((service) => service.slug === facet.serviceSlug);
}

/** The partner record a category draws on, where it draws on one. */
export function getPartnerBlock(facet: CollectionFacet): PartnerBlock | undefined {
  return getPartnerCategoryService(facet)?.partner;
}

/** How many projects a category holds, whichever source it draws on. */
export function getProjectCount(facet: CollectionFacet): number {
  const partner = getPartnerBlock(facet);
  if (partner) return partner.projects.length;
  return projects.filter((project) => inCategory(project, facet)).length;
}

/** One category by its route segment. Throws rather than rendering empty. */
export function getProjectCategory(slug: string): CollectionFacet {
  const category = getProjectCategories().find((facet) => facet.slug === slug);
  if (!category) {
    throw new Error(
      `No project category with slug "${slug}" in /content/pages/projects.json.`,
    );
  }
  return category;
}

/** The projects in one category, in `projects.json` order. */
export function getProjectsInCategory(category: CollectionFacet): Project[] {
  return projects.filter((project) => inCategory(project, category));
}

/**
 * One category's projects split under its subheadings, in the order the
 * subheadings are declared.
 *
 * A group with nothing in it is dropped, and anything the subheadings do not
 * claim is returned last with no heading, so a project can never fall out of
 * the page by being mislabelled. A category that declares no subheadings
 * comes back as one unheaded group, which is the ordinary case.
 */
export function getProjectGroupsInCategory(
  category: CollectionFacet,
): ProjectGroup[] {
  const all = getProjectsInCategory(category);
  const subcategories = category.subcategories ?? [];
  if (!subcategories.length) return [{ items: all }];

  const groups: ProjectGroup[] = subcategories
    .map((sub) => ({
      id: sub.id,
      label: sub.label,
      items: all.filter((project) => project.subcategory === sub.id),
    }))
    .filter((group) => group.items.length > 0);

  const claimed = new Set(subcategories.map((sub) => sub.id));
  const rest = all.filter(
    (project) => !project.subcategory || !claimed.has(project.subcategory),
  );
  if (rest.length) groups.push({ items: rest });

  return groups;
}

/**
 * The category a project belongs to, for its breadcrumb and its card.
 *
 * A project may sit in more than one; the first of its `categories` that is
 * actually published is the one it is filed under.
 */
export function getCategoryForProject(
  project: Project,
): CollectionFacet | undefined {
  const published = getProjectCategories();
  for (const value of project.categories) {
    const found = published.find((facet) => facet.value === value);
    if (found) return found;
  }
  return undefined;
}

/**
 * Every published category a project appears in, for the "also in" line on
 * its detail page.
 */
export function getCategoriesForProject(project: Project): CollectionFacet[] {
  return getProjectCategories().filter((facet) => inCategory(project, facet));
}

/**
 * The project's year, or "" while the client has dates switched off.
 *
 * Every date on the site goes through here, so `showProjectDates` is one
 * edit in site.json rather than a flag each template has to remember.
 */
export function getProjectYear(project: Project): string {
  return site.showProjectDates ? project.year : "";
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
 * A service claiming the project in `relatedProjectSlugs` wins; otherwise its
 * first published category names the owning service — which since the
 * categories mirror the services is the same slug. Returns `undefined` when
 * neither is set, and the detail page then shows no division link.
 */
export function getServiceForProject(project: Project): Service | undefined {
  const claimed = services.find((service) =>
    service.relatedProjectSlugs.includes(project.slug),
  );
  if (claimed) return claimed;

  const slug = getCategoryForProject(project)?.serviceSlug;
  return slug ? services.find((service) => service.slug === slug) : undefined;
}

/** True when the project is filed under this category. */
export function inCategory(project: Project, facet: CollectionFacet): boolean {
  return project.categories.includes(facet.value);
}

/**
 * Whether a category's work was delivered by a partner rather than by Sato.
 *
 * True when the category says so, or when every project in it does. Anything
 * this returns true for carries the attribution line — which is the point of
 * holding `deliveredBy` on the project as well as the category: the digital
 * twin and research projects are arriving from the partner, and the line has
 * to appear with them without anyone remembering to switch it on.
 */
export function isPartnerCategory(facet: CollectionFacet): boolean {
  if (facet.deliveredBy) return facet.deliveredBy === "partner";
  const items = getProjectsInCategory(facet);
  return (
    items.length > 0 && items.every((project) => project.deliveredBy === "partner")
  );
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
