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
  /**
   * Whether a project's date is published. The client is deciding whether the
   * record reads better without dates — the oldest entries are from 2001, and
   * a date column can make a long record look like a wind-down rather than a
   * history. Turning this off hides every year on every card, detail page and
   * category listing; the years stay in `projects.json` either way.
   */
  showProjectDates: boolean;
  /**
   * Whether Home shows the mission and the vision, as a pair, below the motto.
   *
   * The vision used to sit on Home on its own. The client's point was that the
   * two belong together and that both are already on About, so Home is now the
   * welcome and the motto. He may yet want them back — together — so the pair
   * is held in `pages/home.json` and this switches it on in one edit. It is
   * never one without the other: that is the thing he asked us not to do.
   */
  homeShowMissionVision: boolean;
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

/**
 * A subheading inside one project category.
 *
 * A category that holds two recognisably different bodies of work says so
 * rather than running them together: Civil Engineering & Construction is
 * buildings and it is roads, and twenty cards in one undifferentiated grid
 * buries whichever the reader came for. A project names its subheading in
 * `subcategory`; one that names none renders after the last group.
 */
export interface FacetSubcategory {
  id: string;
  label: ConfirmableText;
}

/** A group heading (clients, equipment) or a project category. */
export interface CollectionFacet {
  value: string;
  label: ConfirmableText;
  /**
   * The service this category belongs to — the same slug, for a project
   * category, because the categories now mirror the services one for one.
   * A project detail page links on to it when no service claims the project
   * explicitly in `relatedProjectSlugs`.
   */
  serviceSlug?: string;
  /**
   * Which service category this one sits under, so the Projects dropdown and
   * landing page can be grouped exactly like the Services ones — the four
   * Infrastructure disciplines indented under one heading, the rest at the
   * top level. Resolved through `getProjectBands()`.
   */
  group?: ServiceGroup;
  /**
   * Route segment, where the facet has a page of its own — a project category
   * lives at `/projects/<slug>`. The routes are static files (a second
   * dynamic segment cannot sit beside `[slug]`), so a new category needs a
   * folder as well as this entry. A category with no projects is never
   * published, so it needs no folder until it has one.
   */
  slug?: string;
  /**
   * Where this category's projects come from.
   *
   * `projects` (the default) means `projects.json`, matched on `categories`.
   * `partner` means the `partner.projects` table on the service named by
   * `serviceSlug` — a record held as client/project/year rows rather than as
   * full project entries, because those rows have no scope, no photographs
   * and no detail page. The category still renders as a category; only its
   * source and its layout differ.
   */
  source?: "projects" | "partner";
  /**
   * Who delivered the work in this category, where the whole category is one
   * or the other. A `partner` category carries the attribution line; for a
   * `projects`-sourced category the projects say so individually, through
   * `deliveredBy`, and this may be left unset.
   */
  deliveredBy?: DeliveredBy;
  /** Subheadings within the category, in display order. */
  subcategories?: FacetSubcategory[];
  /** One line under the category heading, on its landing tile and its page. */
  intro?: ConfirmableText;
  /**
   * One or two words, for the places the full label will not fit: the pill on
   * a card, and the typographic slot that stands in for a missing photograph.
   * "Water Resources Development & Management" set at display size in a
   * 4:3 box is not a label, it is an overflow.
   */
  shortLabel?: ConfirmableText;
  /** The photograph on the category's tile and the header of its page. */
  image?: ImageRef;
}

/**
 * One service category's project categories, assembled by `getProjectBands()`.
 *
 * The Projects dropdown and landing page are grouped exactly like the
 * Services ones, so they need the same shape: a heading, and the categories
 * under it. The heading has no page of its own — there is no
 * `/projects/infrastructure` — so unlike `ServiceBand` it carries no `href`.
 */
export interface ProjectBand {
  group: ServiceGroup;
  label: ConfirmableText;
  categories: CollectionFacet[];
}

/** Projects under one subheading of a category. An unnamed group has none. */
export interface ProjectGroup {
  id?: string;
  label?: ConfirmableText;
  items: Project[];
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
  /**
   * Photographs the page's template needs that belong to no single section:
   * its header shot, and — on the services overview — one per service
   * category. Keyed like `labels`, so `groupInfrastructure` resolves both.
   */
  images?: Record<string, ImageRef>;
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
 * These are the five headings a visitor navigates by, not an internal
 * taxonomy. "Infrastructure Services" is the established practice and holds
 * four disciplines behind a landing page; the other four categories are each
 * a single service and render as that service rather than as a heading above
 * one repeated card. Technology used to hold the last two together — the
 * client split it, because a reader looking for digital twin work should not
 * have to know it was filed under something else.
 */
export type ServiceGroup =
  | "infrastructure"
  | "energy"
  | "oil-gas"
  | "digital-twin"
  | "research-innovation";

/** A category with its resolved copy, assembled by `getServiceBands()`. */
export interface ServiceBand {
  group: ServiceGroup;
  label: ConfirmableText;
  /** One line under the category heading. Empty hides it. */
  intro: ConfirmableText;
  /** Landing page for the category, where it has one. */
  href?: string;
  /** The photograph beside the category on the services overview. */
  image?: ImageRef;
  services: Service[];
}

/**
 * `draft` copy was written from partner reference material and has not been
 * approved by Sato. The placeholder gate fails a production build while any
 * division is still draft — see scripts/check-placeholders.mjs.
 */
export type ReviewStatus = "approved" | "draft";

/**
 * One entry in a service page's in-page sub-nav.
 *
 * A service whose page is long enough to need sections declares them here,
 * and that one list drives three things: the sticky sub-nav on the page, the
 * sub-items under the service in the header dropdown, and the row of links
 * under its heading on the services overview. Declaring the sections in
 * content is also what keeps the page template free of any knowledge of
 * which service it is rendering.
 */
export interface ServiceSection {
  /** The anchor, e.g. `capabilities` -> `#capabilities`. */
  id: string;
  label: ConfirmableText;
  /**
   * Where the item points, when the section is not on this page.
   *
   * The Oil & Gas projects moved to `/projects/oil-gas`, and the sub-nav item
   * has to follow them. The anchor stays on the page either way, so an old
   * `#projects` link still lands somewhere sensible — it just finds a short
   * block with this link in it rather than the table itself.
   */
  href?: string;
}

/**
 * The solutions pyramid: four tiers of capability, each broader than the one
 * above it. Held as data and drawn as inline SVG rather than shipped as the
 * source PNG, so it stays crisp, reads in a screen reader and takes the
 * brand palette instead of the deck's primary colours.
 */
export interface SolutionsPyramid {
  heading: ConfirmableText;
  intro?: ConfirmableText;
  /** Bottom tier first, so the array reads in the order the diagram builds. */
  tiers: Array<{ id: string; label: ConfirmableText; items: ConfirmableText[] }>;
  /** Names the diagram for assistive tech. */
  alt: ConfirmableText;
}

/**
 * The business value map: business process -> solutions -> improvements ->
 * benefits. Too tangled to rebuild honestly as SVG, so the source image is
 * shown and the same content is carried underneath as a real table inside a
 * disclosure — which is the accessible alternative, not a caption.
 */
export interface ValueMap {
  heading: ConfirmableText;
  intro?: ConfirmableText;
  image: ImageRef;
  /** Label on the disclosure that opens the text version. */
  alternativeLabel: ConfirmableText;
  columns: {
    process: ConfirmableText;
    solutions: ConfirmableText;
    improvements: ConfirmableText;
    benefits: ConfirmableText;
  };
  rows: Array<{
    id: string;
    process: ConfirmableText;
    note?: ConfirmableText;
    solutions: ConfirmableText[];
    improvements: ConfirmableText[];
    benefits: ConfirmableText[];
  }>;
}

/** A named group of capabilities, where one flat list would be unreadable. */
export interface CapabilityBlock {
  id: string;
  heading: ConfirmableText;
  items: ConfirmableText[];
}

/** One named item in a service list, where a bare phrase needs explaining. */
export interface ServiceListItem {
  name: ConfirmableText;
  /** One or two sentences, set under the name in lighter text. */
  description?: ConfirmableText;
}

/** A subheading within a service list, holding its own items. */
export interface ServiceListGroup {
  id: string;
  heading: ConfirmableText;
  items: ServiceListItem[];
}

/**
 * A heading over a list. Used for solutions and "also covered".
 *
 * A list is either flat (`items`, bare phrases) or grouped (`groups`, each
 * with a subheading and items that may carry a description). Solutions grew
 * past the point where one unbroken column of thirteen phrases could be
 * scanned, so it takes the grouped form; everything else stays flat.
 */
export interface ServiceList {
  heading: ConfirmableText;
  intro?: ConfirmableText;
  items: ConfirmableText[];
  groups?: ServiceListGroup[];
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
  /**
   * Sections this service's page is broken into, in order. Present only on a
   * page long enough to need navigating; absent, the page renders as one run
   * and no sub-nav appears.
   */
  sectionNav?: ServiceSection[];
  solutionsPyramid?: SolutionsPyramid;
  valueMap?: ValueMap;
  relatedProjectSlugs: string[];
  /** Other services to link on to, e.g. oil and gas -> digital twin. */
  relatedServiceSlugs?: string[];
  registrations?: ConfirmableText[];
  /** The header shot. */
  image: ImageRef | null;
  /**
   * Photographs of work delivered under this service, shown as a gallery.
   *
   * Separate from `image`, which is the header shot: these are the client's
   * own labelled photographs of completed work, dropped into
   * `raw-assets/client-photos/<service>/` and processed by
   * `npm run images` (see docs/adding-client-photos.md). Empty is the normal
   * state and the gallery is then not rendered — never placeheld.
   */
  images?: ImageRef[];
  order: number;
}

/* -------------------------------------------------------------- projects */

/**
 * Who delivered a piece of work.
 *
 * `partner` work is shown under an attribution line wherever it appears, on
 * the category page and in the nav count alike. The field is on every project
 * rather than inferred from the category, because the incoming digital twin
 * and research projects are partner work arriving into categories that will
 * otherwise hold Sato's own.
 */
export type DeliveredBy = "sato" | "partner";

export interface Project {
  slug: string;
  title: ConfirmableText;
  /** Optional. Empty means unknown — the field is hidden, never placeheld. */
  client: ConfirmableText;
  /** Optional, as `client`. */
  location: ConfirmableText;
  /**
   * The categories this project appears under, by facet value. More than one
   * is normal — a bulk meter supply is water work and it is electrical work,
   * and a reader looking in either place should find it. The first is the one
   * its breadcrumb and its card name.
   */
  categories: string[];
  /**
   * The subheading it sits under within its category, where that category
   * declares any. Unset renders after the last group.
   */
  subcategory?: string;
  deliveredBy: DeliveredBy;
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

/**
 * `oil-gas-partner` is not one of Sato's own clients. Those organisations
 * were served by the technical partner team, and they are listed under their
 * own attributed heading, kept apart from every other category, so nobody can
 * read them as Sato's contracts.
 */
export type ClientCategory =
  | "federal"
  | "state"
  | "international"
  | "education"
  | "private"
  | "oil-gas-partner";

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
