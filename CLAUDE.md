# CLAUDE.md — Sato Engineering and Infrastructure website

## What this project is

A rebuild of satoengineering.com, the company website of **Sato Engineering & Infrastructure Limited** (formerly **Sato Engineering Nigeria Limited**), an indigenous Nigerian engineering firm incorporated in 1997. The current site is WordPress 3.3.2, last meaningfully updated in 2012. We are replacing it with a fast, static, custom-built site. A light CMS comes later (Phase 2).

## Why it's being built now

The company is sending letters to oil and gas companies. Recipients will visit the site to **verify the company** and learn more. The site must look current, credible and complete before those letters go out. Every design and content decision should serve that visitor: a procurement or contracts officer at an oil company, checking whether Sato is real, established, capable and safe to work with.

What that visitor looks for, in order: the company is real and registered (name, RC number, address, years in business); it has done serious work for serious clients; it has the right capability (services, equipment, people); it takes HSE seriously; how to contact it.

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
4. **Names:** use "Sato Engineering & Infrastructure Limited" in full on first mention per page, "Sato" after. Show "Formerly Sato Engineering Nigeria Limited" on Home (company facts), About and in the footer.
5. **Tone:** plain, factual, confident. Sentence case headings. No superlatives the company can't prove ("foremost", "best", "world class"). Let clients, projects and years speak. **One exception:** the mission and vision statements in `pages/about.json` are the client's own approved wording and are used verbatim, superlatives included.
6. **Accessibility and quality floor:** responsive to 360px, visible focus states, alt text on every image, reduced-motion respected, colour contrast AA, semantic HTML, one `h1` per page.
7. **Performance:** the site should load fast on Nigerian mobile networks. Keep JS minimal, lazy-load below-the-fold images, no heavy animation libraries.
8. After each task, run `npm run build` and fix all errors and type errors before reporting done.

## Sitemap

| Route | Page |
|---|---|
| `/` | Home |
| `/about` | About (story, name change, mission, vision, recognition) |
| `/services` | Services overview — three groups |
| `/services/construction-civil-engineering` | Construction & Civil Engineering |
| `/services/electrical-engineering` | Electrical Engineering |
| `/services/mechanical-engineering` | Mechanical Engineering |
| `/services/water-resources-environmental` | Water Resources & Environmental Engineering |
| `/services/energy` | Energy Services |
| `/services/oil-gas` | Oil & Gas Services |
| `/services/digital-twin` | Digitalization & Digital Twin Services |
| `/services/research-innovation` | Research, Technology & Innovation |
| `/projects` | Project portfolio, filterable by sector (Buildings / Roads & Pavements / Water) |
| `/projects/[slug]` | Project detail |
| `/clients` | Clients |
| `/leadership` | Founder, and how project teams are assembled |
| `/hse` | HSE & Quality |
| `/contact` | Contact |

There is no `/equipment` page. It was removed on the client's instruction;
`equipment.json` stays in the repo in case it returns, and `/equipment` and the
old `/equipments/` redirect to `/about`.

## Content model (Phase 2 CMS will edit these)

- `site.json` — company name, former name, tagline, RC number, founded year, registrations, offices, phones, emails, nav, footer
- `pages/*.json` — per-page headings and body blocks (home, about, services overview, hse, equipment, contact, leadership intro)
- `services.json` — array of service divisions: slug, name, **group** (engineering / energy / technology), **order**, **reviewStatus** (approved / draft), summary, body, capabilities[], relatedProjectSlugs[], image
- `projects.json` — array: slug, title, sector, summary, scope[], images[], and **optional** client, location, year, status. Empty means hidden, never placeheld. `status` is only ever `"Completed"` or empty — the site never labels work as ongoing.
- `clients.json` — array: name, category (federal / state / international / education / private), logo?
- `team.json` — array: slug, name, title, isLeadership, **published**, bio, qualifications[], memberships[], photo?. `published: false` keeps a record in the file but off the site, the sitemap and the structured data.
- `equipment.json` — array: name, category, quantity?, notes?

## Design direction

See prompt 02 and `/docs/design-plan.md`.

Tailwind is **v4**, which is CSS-first and has no `tailwind.config.ts`. All tokens
live in `/styles/tokens.css` in a single `@theme` block, which declares them as
CSS custom properties on `:root` and generates the matching utilities. Swapping
the palette means editing that one file.

The logo has arrived (`/public/images/sato-logo-*.png`, wordmark in a two-tone
green lozenge). The palette is sampled from it and there is **no second hue**:
the laterite accent was retired on the client's instruction, so the family is
`brand` `#177B0B`, `brand-deep` `#2E7229`, `brand-ink` `#136509`, `brand-light`
`#80B076` and `brand-tint` `#E3EDE6`. Tonal separation comes from `brand` versus
`brand-deep`, not from a second colour. `error` `#9A2218` exists for validation
only — never dress an error in the brand colour. Survey yellow stays on focus
rings and the data plate's top bar. Still pending: SVG logo files.

Decisions from the client's form are recorded in
`/docs/decisions/client-answers-v1.md`, which takes precedence over this file
where the two disagree.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
