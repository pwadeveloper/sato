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
6. **Tone:** plain, factual, confident. Sentence case headings. No superlatives the company can't prove ("foremost", "best", "world class"). Let clients, projects and years speak. **One exception:** the mission and vision statements in `pages/about.json` are the client's own approved wording and are used verbatim, superlatives included.
7. **Accessibility and quality floor:** responsive to 360px, visible focus states, alt text on every image, reduced-motion respected, colour contrast AA, semantic HTML, one `h1` per page.
8. **Performance:** the site should load fast on slow mobile networks. Keep JS minimal, lazy-load below-the-fold images, no heavy animation libraries.
9. **Attribution of partner work.** The Oil & Gas service describes a joint offer. Capabilities are written as Sato's ("We provide…"); every project, figure, patent, case study and award belonging to the technical partner sits inside the `partner` block, is rendered under an explicit attribution, and never reaches the Projects page, Sato's project counts or the structured data. Presenting a partner's record as Sato's own would not survive the first vendor-verification call.
10. After each task, run `npm run build` and fix all errors and type errors before reporting done. Before reporting a content change done, also run `npm run check:banned`.

## Sitemap

| Route | Page |
|---|---|
| `/` | Home |
| `/about` | About (story, how we work, where we're going, mission, vision, recognition) |
| `/services` | Services overview — four categories |
| `/services/infrastructure` | **Infrastructure Services** — category landing page |
| `/services/construction-civil-engineering` | Construction & Civil Engineering |
| `/services/electrical-engineering` | Electrical Engineering |
| `/services/mechanical-engineering` | Mechanical Engineering |
| `/services/water-resources-environmental` | Water Resources & Environmental Engineering |
| `/services/energy` | Energy Services |
| `/services/oil-gas` | Oil & Gas Services |
| `/services/digital-twin` | Digitalization & Digital Twin Services |
| `/services/research-innovation` | Research, Technology & Innovation |
| `/projects` | Project portfolio, filtered by service category, then by sector |
| `/projects/[slug]` | Project detail |
| `/clients` | Clients |
| `/leadership` | Founder, and how project teams are assembled |
| `/contact` | Contact |

**Service categories**, in display order, are the `group` values in
`services.json`: `infrastructure` (four disciplines, with a landing page),
`energy` (one), `oil-gas` (one), `technology` (two). `getServiceBands()` in
`lib/content.ts` resolves each category's label, intro and landing-page link
from the `group…` labels in `pages/services.json`, and the header, Home and
the services overview all read from it. A category holding a single service
renders as that service rather than as a heading above one repeated card.

There is no `/equipment` page. It was removed on the client's instruction;
`equipment.json` stays in the repo in case it returns, and `/equipment` and the
old `/equipments/` redirect to `/about`.

**There is no `/hse` page.** HSE is on hold until Sato reviews it with its oil
and gas collaborator. The route is deleted, the page is unregistered in
`lib/content.ts`, it is out of the nav, footer and sitemap, and `/hse` and the
old `/safety-policies/` redirect to `/about`. The rewritten content is kept in
`content/pages/hse.json`.

## Content model (Phase 2 CMS will edit these)

- `site.json` — company name, tagline, founded year, registrations, **ordered** `offices` (no "head office"; the first is the one published in structured data), phones, emails, nav, footer. `rcNumber` is held behind `showRcNumber: false`.
- `pages/*.json` — per-page headings and body blocks (home, about, services overview, infrastructure landing, contact, leadership intro, projects, clients, 404). `hse.json` is present but unregistered.
- `services.json` — array of services: slug, name, **group** (infrastructure / energy / oil-gas / technology), **order**, **reviewStatus** (approved / draft), summary, body, capabilities[], relatedProjectSlugs[], relatedServiceSlugs[], image. A service may also carry `capabilityBlocks[]` (grouped capabilities, which replace the flat sidebar list), `solutions`, `alsoCovered`, `procurement` and `partner` — all optional, all hidden when absent. The `partner` block is the one place another company's track record appears; see rule 9.
- `projects.json` — array: slug, title, sector, summary, scope[], images[], and **optional** client, location, year, status. Sector is a leaf of the project filter, which nests sectors under a service category. Empty means hidden, never placeheld. `status` is only ever `"Completed"` or empty — the site never labels work as ongoing.
- `clients.json` — array: name, category (federal / state / international / education / private), logo?
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

Still pending: SVG logo files, ideally including a stacked lockup.

Decisions are recorded in `/docs/decisions/`, newest wins where they
disagree with this file:

1. `client-answers-v1.md` — the client's form.
2. `client-feedback-batch-2.md` — the call and the oil and gas deck. **This
   is the current one.**

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
