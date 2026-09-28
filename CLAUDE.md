# CLAUDE.md — Sato Engineering and Infrastructure website

## What this project is

A rebuild of satoengineering.com, the company website of **Sato Engineering & Infrastructure Limited**, an engineering and infrastructure company incorporated in 1997. The current site is WordPress 3.3.2, last meaningfully updated in 2012. We are replacing it with a fast, static, custom-built site. A light CMS comes later (Phase 2).

## Why it's being built now

The company is sending letters to oil and gas companies. Recipients will visit the site to **verify the company** and learn more. The site must look current, credible and complete before those letters go out. Every design and content decision should serve that visitor: a procurement or contracts officer at an oil company, checking whether Sato is real, established, capable and safe to work with.

What that visitor looks for, in order: the company is real and established (name, address, years in business); it has done serious work for serious clients; it has the right capability (services, equipment, people); how to contact it.

**The company is expanding beyond its first market** and will register
internationally. Nothing on the site may tie it to one country — see the
banned-terms rule below, which the build enforces.

## Tech stack

- Next.js (App Router) + TypeScript, **static export** (`output: 'export'`)
- Tailwind CSS
- Content in `/content/*.json`, typed with TypeScript interfaces in `/lib/content-types.ts`, loaded through `/lib/content.ts`
- Images in `/public/images/`, optimised at build time (sharp) since static export has no image server
- Deploy target: Vercel (static)
- No database, no auth, no CMS in Phase 1

## Rules

1. **No hardcoded copy in components.** Every heading, paragraph, list item, team member, project and client comes from `/content`. Components receive content as props. This is what makes Phase 2 (CMS) a plug-in rather than a rewrite.
2. **Source of truth for copy is `/docs/site-content.md`.** Transfer it into the JSON files faithfully. Don't invent facts, figures, clients, projects, certifications or years of experience.
3. **Placeholders and optional content — two different things.**
   - `{{CONFIRM: ...}}` is **only** for content the site cannot launch without. It stays as-is in the JSON, is highlighted in development, and fails `npm run build:prod`.
   - Anything **optional** is stored empty (`""` or `[]`) and its section is hidden when empty. Never placehold optional content. Registrations, certifications, safety record, awards, branch offices, social links and project `year` / `location` / `client` all work this way.
   - A division with `"reviewStatus": "draft"` also fails `npm run build:prod`. Unreviewed capability copy must not reach an oil company's procurement team.
4. **Names:** use "Sato Engineering & Infrastructure Limited" in full on first mention per page, "Sato" after. **Never** mention the former name, the change of name, or the RC number. `rcNumber` stays in `site.json` behind `"showRcNumber": false` so it can be restored.
5. **Banned terms, enforced by the build.** `npm run check:banned` scans the exported `/out` and fails on `nigeria` / `nigerian` (any case), `formerly`, and `317208`. It also fails on any email address other than `info@satoengineering.com` and any telephone number other than `+234 803 330 3278` — those two are the only contact details allowed anywhere on the site. Avoid "indigenous" as well; it carries the same implication and the same instruction, even though no pattern catches it. Professional bodies are written as abbreviations (COREN, NSE, NIM) because their full names contain the banned word.

   **One scoped exception: the founder's bio.** The client asked for his own
   profile to name every institution in full, country included, and that is
   his call to make about his own record. It is the only exemption on the
   site. **Do not "fix" the country names out of `content/team.json` —
   they are deliberate.** How it is held:

   - The bio is wrapped in `data-allow-country="true"`, set by the
     `allowCountry` prop on `components/PersonCard.tsx`, which **only
     `app/leadership/page.tsx` passes**.
   - `scripts/check-banned-terms.mjs` skips the country pattern inside that
     element, and **only** that pattern — `formerly`, the RC number, the
     email rule and the phone rule still scan the whole document.
   - The exemption cannot spread: the attribute set to `true` on any file
     outside the leadership route is itself a failure (`country-exception`).
     That is why the styleguide renders a made-up `SAMPLE_PERSON` instead of
     the real team — rendering the real bio would put it on a second page.
   - It must not leak into metadata. `/leadership`'s meta description is
     written without country names, and nothing else carries the bio:
     `buildPageMetadata` reads only `page.metaDescription`, and
     `buildOrganizationSchema` emits no `Person` at all. Injecting a country
     name into that meta description still fails the check — verified.
   - The scan covers the React flight payloads (`leadership.txt`, the
     `__next.*` files) as well as the HTML, because they carry a second copy
     of the same tree.
6. **Tone:** plain, factual, confident. Sentence case headings. No superlatives the company can't prove ("foremost", "best", "world class"). Let clients, projects and years speak. **One exception:** the mission and vision statements in `pages/about.json` are the client's own approved wording and are used verbatim, superlatives included.
7. **Accessibility and quality floor:** responsive to 360px, visible focus states, alt text on every image, reduced-motion respected, colour contrast AA, semantic HTML, one `h1` per page.
8. **Performance:** the site should load fast on slow mobile networks. Keep JS minimal, lazy-load below-the-fold images, no heavy animation libraries.
9. **Attribution of partner work — overridden by the client on 2026-09-28.**
   The rule used to read: every project, figure, patent, case study and award
   belonging to the technical partner sits inside the `partner` block, is
   rendered under an explicit attribution, and never reaches the Projects
   page or Sato's project counts.

   **The client instructed that this work be presented as Sato's own**, and
   the site now does. The attribution lines are gone, and the partner's
   twenty-six projects, wider engagements and case study are a project
   category at `/projects/oil-gas`. **This is deliberate — do not reinstate
   the attribution as a bug fix.** The reservation (oil and gas
   pre-qualification verifies past performance by reference, and permission
   to reuse copy is not a transfer of who delivered the work) was put to the
   client, restated, and overruled. It is recorded in
   `docs/services-for-review.md` and `docs/decisions/client-feedback-batch-4.md`
   so both parties see it before they sign the page off.

   What still holds:

   - Capabilities and solutions are written as Sato's ("We provide…"). That
     never changed.
   - The rows still live in the `partner` block of `services.json` — one
     source of truth, no duplication into `projects.json`, and no individual
     detail pages. `/projects/oil-gas` reads them through the facet's
     `source: "partner"`.
   - The partner's **figures** (project counts, patents, countries) stay
     empty and hidden, because the source numbers contradict each other —
     that was never an attribution question.
   - `/clients` still attributes the seventeen oil and gas clients. Nobody
     asked for that to change; it is flagged in `docs/open-items.md` as an
     inconsistency for the client to settle.
10. After each task, run `npm run build` and fix all errors and type errors before reporting done. Before reporting a content change done, also run `npm run check:banned`.

## Sitemap

| Route | Page |
|---|---|
| `/` | Home |
| `/about` | About (story, how we work, where we're going, mission, vision, recognition) |
| `/services` | Services overview — four categories |
| `/services/infrastructure` | **Infrastructure Services** — category landing page |
| `/services/civil-engineering-construction` | Civil Engineering & Construction |
| `/services/electrical-engineering` | Electrical Engineering |
| `/services/mechanical-engineering` | Mechanical Engineering |
| `/services/water-resources-development-management` | Water Resources Development & Management |
| `/services/energy` | Energy Services |
| `/services/oil-gas` | **Oil & Gas Services** — four anchored sections with a sticky sub-nav |
| `/services/digital-twin` | Digitalization & Digital Twin Services |
| `/services/research-innovation` | Research, Technology & Innovation Services |
| `/projects` | Project categories — four photographic tiles, no project list |
| `/projects/buildings-construction` | Buildings & Construction |
| `/projects/civil-engineering-roads` | Civil Engineering & Roads |
| `/projects/water-resources-development-management` | Water Resources Development & Management |
| `/projects/oil-gas` | **Oil & Gas** — a table, not cards; behind the review gate |
| `/projects/[slug]` | Project detail |
| `/clients` | Clients |
| `/leadership` | Founder, and how project teams are assembled |
| `/contact` | Contact |

**Five service categories**, in display order, are the `group` values in
`services.json`: `infrastructure` (four disciplines, with a landing page),
`energy`, `oil-gas`, `digital-twin` and `research-innovation`. The Technology
group that held the last two together was split on the client's instruction.
`getServiceBands()` in `lib/content.ts` resolves each category's label, intro,
photograph and landing-page link from the `group…` entries in
`pages/services.json` (`labels` for text, `images` for the picture), and the
header and the services overview both read from it. A category holding a
single service renders as that service rather than as a heading above one
repeated card, and **every category heading is a link** — a category of one
links straight to its service.

Two services were renamed. Both old routes 301 in `vercel.json`:
`construction-civil-engineering` → `civil-engineering-construction`, and
`water-resources-environmental` → `water-resources-development-management`.

**Projects is a set of category pages, not a filtered list.** `/projects` is
four photographic tiles with a project count each; the old `?sector=` filter
is gone and those URLs redirect. The categories are the flat `facets` of the
`all-projects` section in `pages/projects.json`, each carrying a `slug`,
`shortLabel`, `intro` and `image`. The four routes are four static files
under `app/projects/` — a second dynamic segment cannot sit beside `[slug]` —
and each is four lines delegating to `components/ProjectCategoryPage.tsx`.
Adding a category is a content edit plus one folder.

**Every project on the site lives under Projects.** No service page lists
projects any more; each links out instead, through
`labels.projectsLink` ("See our {category} projects") to the categories whose
`serviceSlug` names it. Civil Engineering & Construction resolves to two
(Buildings and Roads) and renders one link each; Energy, Digital Twin and
Research resolve to none and render nothing.

**A category draws its projects from one of two sources**, set by `source` on
the facet. The default reads `projects.json`, matched on `sector`, and renders
a grid of `ProjectCard`s. `source: "partner"` reads the `partner.projects`
table on the service named by `serviceSlug` and renders
`PartnerProjects` — a table, the wider engagements and the case study — because
those rows are client, project and year with no scope, no photographs and no
detail page. Oil & Gas is the only one. `getProjectCount()` hides the
difference from the landing tiles and the nav, and
`getPartnerCategoryService()` is what puts the category behind the same review
gate as its service.

**The Oil & Gas service page keeps its four sections**, but "Projects" is now
a link out rather than an anchor: the section declares
`"href": "/projects/oil-gas"` in its `sectionNav` entry, which `SectionNav`
and the header dropdown both honour. The `#projects` anchor stays on the page
so an old link still lands on something — it finds a short block with the link
in it. That is the redirect; no client-side JavaScript is involved.

There is no `/equipment` page. It was removed on the client's instruction;
`equipment.json` stays in the repo in case it returns, and `/equipment` and the
old `/equipments/` redirect to `/about`.

**There is no `/hse` page.** HSE is on hold until Sato reviews it with its oil
and gas collaborator. The route is deleted, the page is unregistered in
`lib/content.ts`, it is out of the nav, footer and sitemap, and `/hse` and the
old `/safety-policies/` redirect to `/about`. The rewritten content is kept in
`content/pages/hse.json`.

## Content model (Phase 2 CMS will edit these)

- `site.json` — company name, tagline, founded year, registrations, **ordered** `offices` (no "head office"; the first is the one published in structured data), phones, emails, nav, footer. `rcNumber` is held behind `showRcNumber: false`. **`showProjectDates`** switches every year on the site off in one edit — cards, category pages and project pages all read it through `getProjectYear()`.
- `pages/*.json` — per-page headings and body blocks (home, about, services overview, infrastructure landing, contact, leadership intro, projects, clients, 404). `hse.json` is present but unregistered. Alongside `labels` (short strings the template needs), a page may carry **`images`** — the photographs its template needs that belong to no single section: its `header` shot, and on the services overview one per category, keyed `groupInfrastructure` and so on.
- `services.json` — array of services: slug, name, **group** (infrastructure / energy / oil-gas / digital-twin / research-innovation), **order**, **reviewStatus** (approved / draft), summary, body, capabilities[], relatedProjectSlugs[], relatedServiceSlugs[], image. A service may also carry `capabilityBlocks[]` (grouped capabilities, which replace the flat sidebar list), `solutions`, `alsoCovered`, `procurement`, `partner`, **`sectionNav[]`**, **`solutionsPyramid`** and **`valueMap`** — all optional, all hidden when absent. A `sectionNav` entry may carry an **`href`**, for a section that has moved off the page. A `ServiceList` (`solutions`, `alsoCovered`, `engagements`) is either flat — `items`, bare phrases — or grouped, with **`groups[]`** of `{ name, description }`; Solutions takes the grouped form because thirteen items in one column stopped being scannable. The `partner` block holds the oil and gas project record, which the client has asked be presented as Sato's own; see rule 9.
- `projects.json` — array: slug, title, sector, summary, scope[], images[], and **optional** client, location, year, status. Sector names the project's category. Empty means hidden, never placeheld. `status` is only ever `"Completed"` or empty — the site never labels work as ongoing.
- `clients.json` — array: name, category (federal / state / international / education / private / **oil-gas-partner**), logo?. The page shows names only — no logos, no category headings, no agencies nested under a government. `oil-gas-partner` entries render in a separate block under their own attributed heading and sit behind the same review gate as the Oil & Gas page. **This heading is now inconsistent with `/projects/oil-gas`**, which no longer attributes; the client was asked which way to settle it (see `docs/open-items.md`) and nothing changes here until he answers.
- `team.json` — array: slug, name, title, isLeadership, **published**, bio, qualifications[], memberships[], photo?. `published: false` keeps a record in the file but off the site, the sitemap and the structured data.
- `equipment.json` — array: name, category, quantity?, notes?

## Design direction

See prompt 02 and `/docs/design-plan.md`.

Tailwind is **v4**, which is CSS-first and has no `tailwind.config.ts`. All tokens
live in `/styles/tokens.css` in a single `@theme` block, which declares them as
CSS custom properties on `:root` and generates the matching utilities. Swapping
the palette means editing that one file.

The logo has arrived. The palette is sampled from it and there is **no second
hue**: the laterite accent was retired on the client's instruction. The family
is `brand` `#2E7229` (primary — buttons, fills, rules), `brand-bright`
`#177B0B` (**highlight fills only**, 4.4:1 on concrete, never text),
`brand-deep` `#1C5718` (hover and pressed), `brand-ink` `#136509` (link and
label text on light, 5.8:1), `brand-light` `#80B076` (text on dark) and
`brand-tint` `#E3EDE6`. Tonal separation comes from `brand` versus
`brand-deep`, not from a second colour. `error` `#9A2218` exists for validation
only — never dress an error in the brand colour. Survey yellow stays on focus
rings, the data plate's top bar and the review-mode banner.

**Type is deliberately heavy.** Display and h1 are weight 900, h2 is 800, and
display / h1 / h2 each sit one step of the 1.25 scale higher at the desktop
end than they did. The display floor at 360px is set by the longest word the
hero carries ("infrastructure"), not by the scale.

**The logo is art-directed by width** (`components/Logo.tsx`). The horizontal
lockup is nearly 8:1 and cannot fit a phone header at a useful height, so
below `md` a stacked lockup runs at 40px, and from `md` up the horizontal one
runs at 52 / 56 / 64px. The 1024–1279px step is 56px rather than 64px because
the full nav needs the rest of the row. Always scale by height with
`width: auto`; never set both dimensions. `--header-height` in `globals.css`
tracks these steps.

Still pending: SVG logo files, ideally including a stacked lockup. The client
has asked the original designer for an updated mark; keep the current one
until it arrives, then drop it into `/brand/` — the sizing rules do not
change.

**Simpler, more visual, less text.** The client read the previous build as
"academic" and asked for something closer to the plainness of the old site.
Three rules follow from it:

- **Every page opens with a photograph.** `components/PageHeader.tsx` sets the
  `h1` and lead on the page background with the picture in a band beneath, and
  every route uses it. Text over a photograph has to be won at each
  breakpoint, and on a header repeated across fifteen pages that fight gets
  lost somewhere. **Oil & Gas is the one exception** — its artwork is drawn
  with an empty arc for exactly that, and it carries two scrims, a horizontal
  wash from `md` up where the copy is in the left column and a flat one below
  it where the copy runs full width. Measured worst case is 7.9:1.
- **The header is one solid bar on every route.** It used to sit transparently
  over the Home hero and take a background once scrolled past; Home no longer
  has white copy over a full-bleed photograph, so the observer that drove it
  is gone with it.
- **The footer is one band**, under 120px on desktop (currently 84px): name
  and © on the left, five links in the middle, phone and email on the right.

**Dropdowns open on click, not hover** (`components/NavMenu.tsx`, shared by
Services and Projects). A hover menu cannot be opened by touch and opens
itself on the way past on a trackpad. The trigger is a real `<button>` with
`aria-expanded`; arrow keys walk the panel, Escape and tabbing out close it,
and closing returns focus to the trigger. Arrow-key entry into the panel is
handled by the document listener alone — the trigger only opens — because
both firing on one press steps over the first item.

Decisions are recorded in `/docs/decisions/`, newest wins where they
disagree with this file:

1. `client-answers-v1.md` — the client's form.
2. `client-feedback-batch-2.md` — the call and the oil and gas deck.
3. `client-feedback-batch-3.md` — simplify, restructure, new copy.
4. `client-feedback-batch-4.md` — everything under Projects, the Sunrise
   services in Solutions, the founder's own bio. **This is the current one.**
   Note that the attribution instruction in its section 1 was itself
   superseded in the same round: the client asked for the partner's projects
   to read as Sato's own work. See rule 9.

## Review deployments

`npm run build:review` sets `NEXT_PUBLIC_REVIEW_MODE=1`, which produces a
production build that still shows its own gaps: unresolved `{{CONFIRM}}`
placeholders are highlighted, draft services carry a banner, and a strip sits
above the header saying it is not the live site. It exists so the client and
his collaborator can read unapproved pages in context. **Never set it on the
production deployment.**

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
