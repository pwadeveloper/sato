/**
 * Content types for the Sato website.
 *
 * Every editable string on the site is typed as `ConfirmableText`, because any
 * of them may still contain a `{{CONFIRM: ...}}` placeholder. Render them
 * through `<RichText>` so unresolved placeholders stay visible in development.
 *
 * Phase 2 (the CMS) edits exactly the shapes in this file.
 */

/** A string that may contain one or more `{{CONFIRM: ...}}` placeholders. */
export type ConfirmableText = string;

export interface Link {
  label: ConfirmableText;
  href: string;
}

export interface ImageRef {
  src: string;
  alt: ConfirmableText;
  width?: number;
  height?: number;
  caption?: ConfirmableText;
}

/* ------------------------------------------------------------------ site */

/**
 * One office. There is no "head office" — every location is just an Office,
 * and display order is the order of the array, so adding a branch is a content
 * edit. The first entry is the one structured data publishes as the address.
 */
export interface Office {
  id: string;
  label: ConfirmableText;
  city: ConfirmableText;
  state: ConfirmableText;
  address: ConfirmableText;
  note?: ConfirmableText;
  /** Google Maps link. Opened in a new tab; never embedded as an iframe. */
  mapUrl?: string;
}

/** A phone number or email address, with the label it is shown under. */
export interface ContactChannel {
  id: string;
  label: ConfirmableText;
  value: ConfirmableText;
  href?: string;
  note?: ConfirmableText;
}

export interface RegistrationGroup {
  id: string;
  label: ConfirmableText;
  items: ConfirmableText[];
}

/** One row of the "Company at a glance" panel. Built by `getCompanyFacts()`. */
export interface CompanyFact {
  id: string;
  label: ConfirmableText;
  value: ConfirmableText;
  note?: ConfirmableText;
}

export interface SiteFooter {
  legal: ConfirmableText;
  navLabel: ConfirmableText;
  links: Link[];
  /** `{year}` is replaced with the build year. */
  copyright: ConfirmableText;
}

export interface Site {
  /** Clean trading name, safe for nav, titles and metadata. */
  name: ConfirmableText;
  /** Canonical origin, no trailing slash. Resolves Open Graph image URLs. */
  url: string;
  /** "Sato" — used after first mention and for the header wordmark. */
  shortName: ConfirmableText;
  /** Registered name as it should appear on the company facts panel. */
  registeredName: ConfirmableText;
  tagline: ConfirmableText;
  description: ConfirmableText;
  foundedYear: number;
  anniversaryNote: ConfirmableText;
  rcNumber: ConfirmableText;
  /**
   * The RC number is held so it can be restored, but it is off the site: the
   * company is registering internationally and a single national registration
   * number on every page reads against that. Nothing renders it while false.
   */
  showRcNumber: boolean;
  offices: Office[];
  phones: ContactChannel[];
  emails: ContactChannel[];
  registrations: RegistrationGroup[];
  /** Labels for the rows `getCompanyFacts()` assembles. */
  factLabels: {
    registeredName: ConfirmableText;
    incorporated: ConfirmableText;
    yearsInOperation: ConfirmableText;
    rcNumber: ConfirmableText;
    offices: ConfirmableText;
    registrations: ConfirmableText;
  };
  skipLinkLabel: ConfirmableText;
  navLabel: ConfirmableText;
  menuOpenLabel: ConfirmableText;
  menuCloseLabel: ConfirmableText;
  logoAlt: ConfirmableText;
  nav: Link[];
  footer: SiteFooter;
  /**
   * Wide shots cleared for use as a page hero. None contains an identifiable
   * person, so a hero can be cropped freely without a consent question.
   */
  heroImages: ImageRef[];
  /**
   * Default Open Graph card — the branded one from `npm run og`, not a site
   * photograph. Pages with a better image of their own override it.
   */
  ogImage: ImageRef;
  /**
   * Where the contact form POSTs. The site is a static export with no server,
   * so this is a third-party form endpoint. An empty string falls the form
   * back to composing a mailto: in the visitor's own mail client.
   */
  contactFormEndpoint: string;
}

/* ----------------------------------------------------------------- pages */

export type CollectionName =
  | "serviceGroups"
  | "services"
  | "projects"
  | "clients"
  | "team"
  | "equipment";

/** A filter tab (projects) or a group heading (clients, equipment). */
export interface CollectionFacet {
  value: string;
  label: ConfirmableText;
  /**
   * The division this sector belongs to. A project detail page links on to it
   * when no service claims the project explicitly in `relatedProjectSlugs`.
   */
  serviceSlug?: string;
  /**
   * Sub-filters, so the project index can mirror the service structure: the
   * top row is the service category and the second row narrows within it.
   * A parent facet matches a project whose sector is the parent's own value
   * OR any child's, which is what lets "Infrastructure Services" show
   * buildings, roads and water together.
   */
  children?: CollectionFacet[];
}

export interface HeroSection {
  type: "hero";
  id: string;
  /** Omit where the page `h1` (`page.title`) is already the hero heading. */
  heading?: ConfirmableText;
  subhead?: ConfirmableText;
  ctas?: Link[];
  /** The wide shot under the headline. Falls back to `site.heroImages[0]`. */
  image?: ImageRef;
  /**
   * Full-bleed background photographs, crossfaded behind the copy. Their
   * exposure is already pulled down at build time (see image-map.json), and
   * the hero lays a scrim over them on top of that.
   */
  backgroundImages?: ImageRef[];
}

export interface ProseSection {
  type: "prose";
  id: string;
  heading?: ConfirmableText;
  body: ConfirmableText[];
}

export interface ListSection {
  type: "list";
  id: string;
  heading?: ConfirmableText;
  intro?: ConfirmableText;
  items: ConfirmableText[];
  note?: ConfirmableText;
}

/** Renders the company facts panel from site.json. */
export interface FactsSection {
  type: "facts";
  id: string;
  heading: ConfirmableText;
  note?: ConfirmableText;
}

/** Pulls items out of one of the content collections. */
export interface CollectionSection {
  type: "collection";
  id: string;
  heading?: ConfirmableText;
  intro?: ConfirmableText;
  collection: CollectionName;
  /** Explicit subset, in display order. Omit to show everything. */
  slugs?: string[];
  facets?: CollectionFacet[];
  facetMode?: "filter" | "group";
  /** Link on to the full listing, e.g. "View all projects". */
  ctas?: Link[];
  note?: ConfirmableText;
}

export interface CtaSection {
  type: "cta";
  id: string;
  heading?: ConfirmableText;
  body?: ConfirmableText;
  ctas: Link[];
}

export interface FormField {
  name: string;
  label: ConfirmableText;
  type: "text" | "email" | "tel" | "select" | "textarea";
  required: boolean;
  options?: ConfirmableText[];
}

export interface FormSection {
  type: "form";
  id: string;
  heading?: ConfirmableText;
  fields: FormField[];
  submitLabel: ConfirmableText;
  sendingLabel: ConfirmableText;
  /** Shown after a successful send. Says what happens next. */
  successHeading: ConfirmableText;
  successBody: ConfirmableText;
  /** Shown when the endpoint rejects or is unreachable. */
  errorMessage: ConfirmableText;
  /** Inline validation copy. */
  requiredMessage: ConfirmableText;
  emailMessage: ConfirmableText;
  /** Shown after the mailto: composer opens. Not the same as "sent". */
  mailtoHeading: ConfirmableText;
  mailtoBody: ConfirmableText;
  /** Shown when neither an endpoint nor a usable address is configured. */
  unavailableMessage: ConfirmableText;
  /** Explains the mailto: fallback when no endpoint is configured. */
  fallbackNote: ConfirmableText;
  note?: ConfirmableText;
}

/** Renders the office list from site.json. */
export interface OfficesSection {
  type: "offices";
  id: string;
  heading?: ConfirmableText;
  note?: ConfirmableText;
}

/** A row of cards that each link somewhere else on the site. */
export interface LinkCardsSection {
  type: "linkCards";
  id: string;
  heading: ConfirmableText;
  intro?: ConfirmableText;
  items: Array<{
    label: ConfirmableText;
    body: ConfirmableText;
    href: string;
  }>;
}

export type PageSection =
  | HeroSection
  | LinkCardsSection
  | ProseSection
  | ListSection
  | FactsSection
  | CollectionSection
  | CtaSection
  | FormSection
  | OfficesSection;

export interface Page {
  slug: string;
  /**
   * Short labels the page's template needs that belong to no single section —
   * a sidebar heading, an aria-label. Keeps them out of the components.
   */
  labels?: Record<string, ConfirmableText>;
  /** The page's single `h1`. */
  title: ConfirmableText;
  metaTitle?: ConfirmableText;
  metaDescription?: ConfirmableText;
  /** Open Graph image. Falls back to the first of `site.heroImages`. */
  ogImage?: ImageRef;
  sections: PageSection[];
}

/* -------------------------------------------------------------- services */

/**
 * Which top-level category a service sits in, in display order.
 *
 * These are the categories a visitor navigates by, not an internal taxonomy:
 * "Infrastructure Services" is the established practice and has a landing
 * page of its own; Energy and Oil & Gas each stand alone; Technology holds
 * the two newer digital services.
 */
export type ServiceGroup = "infrastructure" | "energy" | "oil-gas" | "technology";

/** A category with its resolved copy, assembled by `getServiceBands()`. */
export interface ServiceBand {
  group: ServiceGroup;
  label: ConfirmableText;
  /** One line under the category heading. Empty hides it. */
  intro: ConfirmableText;
  /** Landing page for the category, where it has one. */
  href?: string;
  services: Service[];
}

/**
 * `draft` copy was written from partner reference material and has not been
 * approved by Sato. The placeholder gate fails a production build while any
 * division is still draft — see scripts/check-placeholders.mjs.
 */
export type ReviewStatus = "approved" | "draft";

/** A named group of capabilities, where one flat list would be unreadable. */
export interface CapabilityBlock {
  id: string;
  heading: ConfirmableText;
  items: ConfirmableText[];
}

/** A heading over a plain list. Used for solutions and "also covered". */
export interface ServiceList {
  heading: ConfirmableText;
  intro?: ConfirmableText;
  items: ConfirmableText[];
}

/** One class of equipment Sato sources, and the makes offered in it. */
export interface ProcurementCategory {
  id: string;
  label: ConfirmableText;
  /** Manufacturer names, set in lighter text after the category. */
  brands: ConfirmableText[];
}

export interface ProcurementBlock {
  heading: ConfirmableText;
  intro: ConfirmableText;
  categories: ProcurementCategory[];
  /** Caveat under the block. Carries the `{{CONFIRM}}` about brand naming. */
  note?: ConfirmableText;
}

/** One row of the partner track record. Never a Sato project. */
export interface PartnerProject {
  client: ConfirmableText;
  project: ConfirmableText;
  year: ConfirmableText;
}

/** A headline number. Published only once the figure is settled. */
export interface PartnerFigure {
  value: ConfirmableText;
  label: ConfirmableText;
}

export interface PartnerCaseStudy {
  heading: ConfirmableText;
  /** Marks the whole block as the partner team's work, not Sato's. */
  attribution: ConfirmableText;
  challengeHeading: ConfirmableText;
  challenge: ConfirmableText;
  solutionHeading: ConfirmableText;
  solution: ConfirmableText;
  resultsHeading: ConfirmableText;
  resultsIntro: ConfirmableText;
  results: ConfirmableText[];
  note?: ConfirmableText;
}

/**
 * Work delivered by a technical partner, not by Sato.
 *
 * This block exists to keep the two records apart. Everything inside it is
 * rendered under an explicit attribution line, and none of it reaches the
 * projects index, the project count or Sato's structured data. Presenting a
 * partner's track record as Sato's own would not survive the first
 * vendor-verification call.
 */
export interface PartnerBlock {
  heading: ConfirmableText;
  intro: ConfirmableText;
  /** The collaborator's name. Empty until Sato confirms we may print it. */
  name: ConfirmableText;
  /** Label for the name, e.g. "Technical partner". */
  nameLabel: ConfirmableText;
  /** Empty while the source figures disagree — the strip is then hidden. */
  figures: PartnerFigure[];
  projectsHeading: ConfirmableText;
  projectColumns: { client: ConfirmableText; project: ConfirmableText; year: ConfirmableText };
  projects: PartnerProject[];
  /** Rows shown before the "Show all" disclosure opens. */
  projectsInitialCount: number;
  projectsShowAllLabel: ConfirmableText;
  projectsShowLessLabel: ConfirmableText;
  /** Read out inside the disclosure, whose rows appear above the control. */
  projectsDisclosureNote: ConfirmableText;
  engagements?: ServiceList;
  caseStudy?: PartnerCaseStudy;
  recognition?: ServiceList;
}

export interface Service {
  slug: string;
  name: ConfirmableText;
  group: ServiceGroup;
  reviewStatus: ReviewStatus;
  /** One-line version used in the Home divisions strip. */
  shortSummary: ConfirmableText;
  /** Fuller summary used on the services overview and division pages. */
  summary: ConfirmableText;
  body: ConfirmableText[];
  capabilities: ConfirmableText[];
  /**
   * Grouped capabilities, for a service whose offer is too broad for one
   * list. When present the flat `capabilities` sidebar is not rendered.
   */
  capabilityBlocks?: CapabilityBlock[];
  /** Named solutions, set as a dense two-column list. */
  solutions?: ServiceList;
  /** Shorter secondary scope list under the solutions. */
  alsoCovered?: ServiceList;
  procurement?: ProcurementBlock;
  partner?: PartnerBlock;
  relatedProjectSlugs: string[];
  /** Other services to link on to, e.g. oil and gas -> digital twin. */
  relatedServiceSlugs?: string[];
  registrations?: ConfirmableText[];
  image: ImageRef | null;
  order: number;
}

/* -------------------------------------------------------------- projects */

export type ProjectSector = "buildings" | "roads" | "water" | "energy";

export interface Project {
  slug: string;
  title: ConfirmableText;
  /** Optional. Empty means unknown — the field is hidden, never placeheld. */
  client: ConfirmableText;
  /** Optional, as `client`. */
  location: ConfirmableText;
  sector: ProjectSector;
  /** Optional. Either a year, or "Awarded 2012" where only the award is known. */
  year: ConfirmableText;
  /** Only ever "Completed" or empty. The site never labels work in progress. */
  status: ConfirmableText;
  summary: ConfirmableText;
  scope: ConfirmableText[];
  images: ImageRef[];
  featured: boolean;
}

/* --------------------------------------------------------------- clients */

export type ClientCategory =
  | "federal"
  | "state"
  | "international"
  | "education"
  | "private";

export interface Client {
  slug: string;
  name: ConfirmableText;
  category: ClientCategory;
  /** Parent body, where the client is a unit of a larger government. */
  parent?: ConfirmableText;
  /** Named agencies or units engaged under this client. */
  units?: ConfirmableText[];
  logo: ImageRef | null;
  featured: boolean;
}

/* ------------------------------------------------------------------ team */

export interface TeamMember {
  slug: string;
  name: ConfirmableText;
  title: ConfirmableText;
  isLeadership: boolean;
  bio: ConfirmableText[];
  qualifications: ConfirmableText[];
  memberships: ConfirmableText[];
  yearsExperience?: ConfirmableText;
  photo: ImageRef | null;
  /**
   * Off the site entirely when false — not rendered, not in the sitemap, not
   * in structured data. Used for people whose status Sato has not confirmed.
   */
  published: boolean;
  /** `unverified` members appear only in older indexed versions of the site. */
  status: "current" | "unverified";
  order: number;
}

/* ------------------------------------------------------------- equipment */

export interface Equipment {
  slug: string;
  name: ConfirmableText;
  category: string;
  quantity?: ConfirmableText;
  /** Make and model, as listed on the equipment schedule. */
  notes?: ConfirmableText;
  /** Yard the item is held at. */
  location?: ConfirmableText;
  /** Photograph of this item, where one was recovered from the old site. */
  image?: ImageRef;
}
