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

export interface Office {
  id: string;
  label: ConfirmableText;
  city: ConfirmableText;
  state: ConfirmableText;
  address: ConfirmableText;
  note?: ConfirmableText;
  /** Google Maps link. Opened in a new tab; never embedded as an iframe. */
  mapUrl?: string;
  isPrimary: boolean;
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
  formerName: ConfirmableText;
  /** Ready-made "Formerly ..." line for Home, About and the footer. */
  formerNameLabel: ConfirmableText;
  tagline: ConfirmableText;
  description: ConfirmableText;
  foundedYear: number;
  anniversaryNote: ConfirmableText;
  rcNumber: ConfirmableText;
  offices: Office[];
  phones: ContactChannel[];
  emails: ContactChannel[];
  registrations: RegistrationGroup[];
  /** Labels for the rows `getCompanyFacts()` assembles. */
  factLabels: {
    registeredName: ConfirmableText;
    formerName: ConfirmableText;
    incorporated: ConfirmableText;
    yearsInOperation: ConfirmableText;
    rcNumber: ConfirmableText;
    headOffice: ConfirmableText;
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
   * Where the contact form POSTs. The site is a static export with no server,
   * so this is a third-party form endpoint. An empty string falls the form
   * back to composing a mailto: in the visitor's own mail client.
   */
  contactFormEndpoint: string;
}

/* ----------------------------------------------------------------- pages */

export type CollectionName =
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
}

export interface HeroSection {
  type: "hero";
  id: string;
  /** Omit where the page `h1` (`page.title`) is already the hero heading. */
  heading?: ConfirmableText;
  subhead?: ConfirmableText;
  ctas?: Link[];
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

export interface Service {
  slug: string;
  name: ConfirmableText;
  /** One-line version used in the Home divisions strip. */
  shortSummary: ConfirmableText;
  /** Fuller summary used on the services overview and division pages. */
  summary: ConfirmableText;
  body: ConfirmableText[];
  capabilities: ConfirmableText[];
  relatedProjectSlugs: string[];
  registrations?: ConfirmableText[];
  image: ImageRef | null;
  order: number;
}

/* -------------------------------------------------------------- projects */

export type ProjectSector = "buildings" | "roads" | "water" | "energy";

export interface Project {
  slug: string;
  title: ConfirmableText;
  client: ConfirmableText;
  location: ConfirmableText;
  sector: ProjectSector;
  year: ConfirmableText;
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
