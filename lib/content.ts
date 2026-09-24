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
import equipmentPageJson from "@/content/pages/equipment.json";
import homePageJson from "@/content/pages/home.json";
import hsePageJson from "@/content/pages/hse.json";
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

const team = typed<TeamMember[]>(teamJson)
  .slice()
  .sort((a, b) => a.order - b.order);

const equipment = typed<Equipment[]>(equipmentJson);

const pages: Record<string, Page> = {
  home: typed<Page>(homePageJson),
  about: typed<Page>(aboutPageJson),
  services: typed<Page>(servicesPageJson),
  projects: typed<Page>(projectsPageJson),
  clients: typed<Page>(clientsPageJson),
  leadership: typed<Page>(leadershipPageJson),
  hse: typed<Page>(hsePageJson),
  equipment: typed<Page>(equipmentPageJson),
  contact: typed<Page>(contactPageJson),
};

/* ------------------------------------------------------------------ site */

export function getSite(): Site {
  return site;
}

/** Years in operation, derived from the founding year at build time. */
export function getYearsInOperation(): number {
  return new Date().getFullYear() - site.foundedYear;
}

/** The "Company at a glance" rows, assembled from site.json. */
export function getCompanyFacts(): CompanyFact[] {
  const labels = site.factLabels;
  const headOffice = site.offices.find((office) => office.isPrimary);
  const professional = site.registrations.find(
    (group) => group.id === "professional",
  );

  const facts: CompanyFact[] = [
    { id: "registeredName", label: labels.registeredName, value: site.registeredName },
    { id: "formerName", label: labels.formerName, value: site.formerName },
    { id: "incorporated", label: labels.incorporated, value: String(site.foundedYear) },
    {
      id: "yearsInOperation",
      label: labels.yearsInOperation,
      value: String(getYearsInOperation()),
      note: site.anniversaryNote,
    },
    { id: "rcNumber", label: labels.rcNumber, value: site.rcNumber },
  ];

  if (headOffice) {
    facts.push({ id: "headOffice", label: labels.headOffice, value: headOffice.address });
  }

  if (professional) {
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

  const slug = facets.find((facet) => facet.value === project.sector)?.serviceSlug;
  return slug ? services.find((service) => service.slug === slug) : undefined;
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
