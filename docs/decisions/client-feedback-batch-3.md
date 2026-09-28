# Prompt 12 — Client feedback batch 3 (simplify, restructure, new copy)

The client has reviewed the site and sent written updates plus call feedback. The overall direction: **simpler, more visual, less text-heavy.** He described the current site as feeling "academic", and wants something closer to the plainness of the old site.

Implement everything below in one pass. **Where this file conflicts with CLAUDE.md, docs/site-content.md or prompts 01–11, this file wins.** Update CLAUDE.md and docs/site-content.md to match, and save this file as `docs/decisions/client-feedback-batch-3.md`.

All the rules from prompt 11 still apply: no "Nigeria" / "Nigerian" / "formerly" / "317208" anywhere in the exported site, only info@satoengineering.com and +234 803 330 3278 as contact details, and partner work always attributed to the partner team.

Copy marked **verbatim** is the client's own wording: use it exactly, except where section 1 says otherwise.

Start with a short plan (files changed, routes added, removed or renamed, conflicts), then proceed.

---

## 1. Handling the client's copy against the "no Nigeria" rule

The client's new bio (section 8) names several Nigerian institutions in full. The banned-terms check must still pass. Use the adapted wording given in section 8, which uses the bodies' abbreviations and drops country names from the universities. Don't weaken or bypass the check. List this adaptation in `docs/open-items.md` so the client can confirm he's happy with it.

## 2. Global changes

- **Home button:** add an explicit "Home" item as the first link in the main nav (desktop and mobile), in addition to the logo link.
- **Nav order:** Home · About · Services ▾ · Projects ▾ · Leadership · Contact. Clients moves out of the main nav (section 7).
- **Dropdowns open on click**, not hover only: click/tap to open, show all sub-items at once, close on Escape, outside click, or selecting an item. Keyboard accessible (Enter/Space opens, arrow keys move, focus returns to the trigger on close). Same component for Services and Projects.
- **Footer: much shorter.** The client says the bottom section is too tall and wants it basic, like the old site. Replace the multi-column footer with one compact band: company name and © year on the left; About, Services, Projects, Clients, Contact links in the middle; phone and email on the right. Stacks to three short lines on mobile. Target ≤ 120px tall on desktop.
- **Less "academic", more visual:**
  - Every page gets a photographic header or a prominent image (use the best images from `/public/images/` and the new oil and gas images in section 5).
  - Reduce visible text density: shorter measure is fine, but cut visual clutter such as bordered boxes, dense tables and repeated labels. Prefer image + short paragraph over text blocks.
  - Keep the bolder type and larger logo from prompt 11.
- **Logo:** the client has asked the original designer for the updated logo file. It isn't here yet; keep the current logo. When it arrives in `/brand/`, swap it in (same sizing rules as prompt 11).

## 3. Home: simple and welcoming

Replace the current Home page with exactly three things, and nothing else:

1. **Hero with welcome** (over or beside the strongest project photograph):
   - Heading (verbatim): **Welcome to Sato Engineering & Infrastructure**
   - Body (verbatim):
     > Established in 1997, Sato Engineering & Infrastructure Limited has built nearly three decades of experience delivering complex projects and integrated solutions across diverse sectors.
     >
     > Today, we bring together engineering expertise, project management, technology and innovation across Building, Civil Engineering & Infrastructure, Electro-Mechanical Services, Water Resources Development & Management, Energy, Oil & Gas, Digitalization & Digital Twin Services, and Research, Technology & Innovation. We remain focused on delivering sustainable, high-quality solutions that create lasting value for our clients and the communities they serve.
2. **Motto:** Quality Engineering since 1997
3. **Vision:** To be a globally recognized engineering and infrastructure company, renowned for excellence, innovation and world-class project delivery.

Remove from Home: What we do, Company at a glance panel, Trusted by, Selected projects, closing CTA band. Keep the components in the codebase (unused); the client said "build on it later".

## 4. About: basic, like the old site

Single column, plain layout, one supporting photo at most. Content, in order (all verbatim):

**Heading:** About Sato Engineering & Infrastructure

> Established in 1997, Sato Engineering & Infrastructure Limited has grown from its foundations in engineering and construction into a multidisciplinary organization with capabilities spanning infrastructure, water resources, electro-mechanical systems, energy, oil and gas, digital technologies, and research and innovation.
>
> Over nearly three decades, we have delivered projects for public and private sector clients, development institutions and communities, building a track record founded on technical expertise, effective project management and reliable delivery.
>
> Our capabilities encompass Building, Civil Engineering & Infrastructure, Electro-Mechanical Services, Water Resources Development & Management, Energy Services, Oil & Gas Services, Digitalization & Digital Twin Services, and Research, Technology & Innovation. This breadth enables us to approach projects from an integrated perspective, combining established engineering practice with technology-driven solutions and emerging innovations.
>
> At the heart of Sato is a team of experienced professionals committed to delivering solutions that respond to the evolving needs of our clients and the sectors we serve. As infrastructure and industry continue to evolve, we continue to strengthen our capabilities and expand the solutions we provide.

**Motto:** Quality Engineering since 1997
**Mission (updated wording):** To deliver innovative and sustainable engineering and infrastructure solutions that meet the highest standards, exceed client expectations and create lasting value.
**Vision:** To be a globally recognized engineering and infrastructure company, renowned for excellence, innovation and world-class project delivery.

Remove from About: How we work, Where we're going, Recognition, CTAs. Update the mission everywhere it appears (it changed from the prompt 10 version).

## 5. Services

### Structure (five top-level services, in this order)

| # | Heading | Route | Sub-items shown in dropdown and on the Services page |
|---|---|---|---|
| 1 | Infrastructure Services | `/services/infrastructure` | Civil Engineering & Construction · Electrical Engineering · Mechanical Engineering · Water Resources Development & Management |
| 2 | Energy Services | `/services/energy` | — |
| 3 | Oil & Gas Services | `/services/oil-gas` | Capabilities · Solutions · Projects · Partnerships (anchor links to sections of the page) |
| 4 | Digitalization & Digital Twin Services | `/services/digital-twin` | — |
| 5 | Research, Technology & Innovation Services | `/services/research-innovation` | — |

- **The Technology group is split:** Digitalization & Digital Twin Services and Research, Technology & Innovation Services are now separate top-level services. Remove the "Technology" group from services.json, nav and pages.
- **Renames:**
  - "Construction & Civil Engineering" → **Civil Engineering & Construction**. New route `/services/civil-engineering-construction`; 301 from the old route.
  - "Water Resources & Environmental Engineering" → **Water Resources Development & Management**. New route `/services/water-resources-development-management`; 301 from the old route. Remove "environmental" from its summary; keep its capabilities.
- **Energy Services and Oil & Gas Services headings are not final** (the client is deciding whether one should read "Oil & Gas Technology" or similar). Keep the current names; make sure each name lives in one field in services.json so the rename is a one-line change. Add this to `docs/open-items.md`.
- The Services dropdown keeps its current design: click opens it, showing all five headings with their sub-items (section 2 behaviour).

### Services page content (verbatim)

**Heading:** Services

> Sato Engineering & Infrastructure Limited delivers integrated engineering, infrastructure and technology-driven solutions across a diverse range of sectors.
>
> Building on nearly three decades of engineering and project delivery experience, we combine multidisciplinary technical expertise, strong project management capabilities and evolving technologies to deliver solutions tailored to the needs of our clients and the industries we serve.

Then the five service headings. **Each heading is a live link to its service page** (client's explicit instruction). Under Infrastructure Services, show the four sub-services as a single separated line, each also a link. Under Oil & Gas Services, show "Capabilities | Solutions | Projects | Partnerships", each linking to its anchor on the Oil & Gas page. Give each heading a photograph so the page reads visually, not as a list.

### Why Sato? (placement: on the Services page, after the five services)

The client asked for the old site's "Why Sato" / "How we work" idea to be placed where it fits best. His document puts it on the Services page, which is the right place: it answers "why choose you" at the point visitors compare capabilities. Verbatim:

**Why Sato?**
> Our strength is built on decades of engineering experience, technical capability and a consistent commitment to delivering quality and value.

- Proven engineering and project delivery experience
- Multidisciplinary technical capabilities
- Strong project management capabilities
- Quality and timely delivery
- Reliability and dependability
- Integrity and professional responsibility
- Client-focused approach
- Commitment to sustainable solutions and lasting value
- Established track record and reputation

Lay the nine points out as a compact grid (three columns on desktop), not a long bullet list.

### Oil & Gas Services page: restructure into four anchored sections

The client has confirmed that content from the collaborator's deck can be used directly. Reorganise the existing Oil & Gas content (from prompt 11) into four sections, with a sticky in-page sub-nav: **Capabilities · Solutions · Projects · Partnerships**. Section IDs: `#capabilities`, `#solutions`, `#projects`, `#partnerships`.

- **Capabilities:** the overview paragraphs, the three capability areas, and the "also covered" list.
- **Solutions:** the technology solutions list; the solutions pyramid diagram; the business value map diagram; equipment sourcing and procurement.
- **Projects:** the partner project table, the wider engagements list and the case study. Attribution stays exactly as in prompt 11 ("Experience of our partner team").
- **Partnerships:** the partner team description, the recognition (2015 SPE International P&O Award; strategic partnerships with leading universities in the USA and Canada), and the partner name block (still hidden until confirmed).

**Images from the deck** (in `sato-oil-gas-images.zip`; unzip into `/raw-assets/oil-gas/` and optimise into `/public/images/oil-gas/` with the prompt 03 script):
- `oil-gas-hero-platforms.jpg` and `oil-gas-hero-rig.jpg`: green-tinted offshore platform photographs, 1672×941, with a white/green arc on the left. Use one as the Oil & Gas page header (text over the lighter left area, or crop to the right-hand platforms), and the other as the Oil & Gas image on the Services page. Check text contrast over them.
- `oil-gas-solutions-pyramid.png`: a four-tier pyramid (Surveillance → Analysis → Optimization → Transformation). **Rebuild it as an inline SVG** using the PNG as reference, so it's crisp and accessible; fix the source typo "Surveilance" to "Surveillance". Tiers, bottom to top:
  - Surveillance: Production Allocation, Well Test Validation, KPI Monitoring, Zonal Split Calculation, Virtual Metering, BHP & BHT Correction, Reserves Tracking
  - Analysis: Flow Assurance, Production Decline Analysis, Reservoir Performance, Model Updating, Production Performance
  - Optimization: Short Term Work Plans, Long Term Work Plans, Mid Term Work Plans
  - Transformation: Maximum Ultimate Recovery
- `oil-gas-value-map.png`: a map from business processes → solutions → improvements → benefits. **Use the PNG** (it's too complex to rebuild well), shown in a scrollable container on mobile, with a text alternative below it in a `<details>` element:
  - Effective field development: 4D seismic, smart wells → fewer development wells, improved sweep, increased well production → reduced CAPEX, increased recovery, increased production
  - Well and reservoir management (smart fields foundation): integrated production system modelling, production performance monitoring → increased well production, facility improvement, reduced deferment → increased production
  - Facilities management: collaborative work environments, real-time surveillance, rotating equipment monitoring → faster response and optimized production, increased facility capacity, increased availability → increased production, reduced OPEX
  - Effective operations: integrity monitoring, remote operations → increased efficiency, reduced logistics → reduced OPEX, improved HSE
- Don't use the deck's world maps or revenue charts (map licensing, and the partner's figures are still unconfirmed).

Review gate: keep `"reviewStatus": "draft"` on Oil & Gas until the partner returns Part B of the open-items form (client names, figures, case study). I'll switch it to approved when that arrives.

## 6. Projects: click-through by category

The client doesn't want all projects on one long page: visitors landing for water work shouldn't have to scroll past everything else, and categories get missed. Apply the same pattern as Services.

- `/projects` becomes a **category landing page**: a short intro line and one large photographic tile per category, each showing the category name and project count, linking to its category page. No project list on this page.
- Categories (match the old site's structure, with the client's new naming):
  | Category | Route |
  |---|---|
  | Buildings & Construction | `/projects/buildings-construction` |
  | Civil Engineering & Roads | `/projects/civil-engineering-roads` |
  | Water Resources Development & Management | `/projects/water-resources-development-management` |
- Each category page shows only that category's projects, as image-led cards. Include a small "Other categories" row at the bottom linking to the others.
- Projects nav item becomes a click dropdown listing the categories (same component as Services).
- Project detail pages stay at `/projects/[slug]`; their breadcrumb goes Projects › Category › Project.
- Remove the old `?sector=` filter UI. Redirect old filter URLs (`/projects?sector=water` etc.) to the matching category page (client-side redirect is fine for query strings).
- Dates: the client may remove dates later. Add `"showProjectDates": true` to site.json and have every project date respect it.
- Photos: many projects have none. Use every usable old-site image; projects without one get the typographic treatment. List photo-less projects in `docs/open-items.md` so the client can supply photos (he said he'll work on the projects content).
- The partner's oil and gas projects still don't appear here; they stay on the Oil & Gas page.

## 7. Clients: simple list, low prominence

- The client wants a **simple list of names only**, not a focal point.
- `/clients` page: short heading, then a plain multi-column list of client names. Flatten the grouping: no agencies nested under state governments (list the parent government or agency names as single entries), no category headings for Sato's own clients, no logos, no descriptions.
- Add a second, clearly separated short list for oil and gas clients, headed **"Oil & Gas: clients served through our technical partners"**: ADNOC, ADNOC Gas, Al Dhafra, Kuwait Oil Company, Chevron, Ecopetrol, Pacific Rubiales, Santos, Halliburton, Vaalco, Saudi Aramco, Pemex, PDVSA, Repsol, US Bureau of Land Management, E3 Lithium, Enrema. Keep the heading's attribution wording exactly; these are the partner team's clients, not Sato's direct clients. This list is behind the same review gate as the Oil & Gas page (section 5).
- Remove Clients from the main nav and Home. Link it from the footer and from the bottom of the Projects landing page ("Clients we've worked with").

## 8. Leadership

Leadership stays in the main nav with Engr. Wale Osamiluyi as the only entry. Replace his profile with the client's updated bio, adapted per section 1. Add his SPE membership.

**Name:** Engr. Wale Osamiluyi, FNSE, FRICS, FNIEEE, FNIWE
**Title:** Founder & Managing Director

> Engr. Wale Osamiluyi founded Sato Engineering in 1997 and has led its growth and evolution into Sato Engineering & Infrastructure Limited. An engineer with over 32 years of professional and executive experience, he provides strategic leadership and direction across the Company's multidisciplinary engineering, infrastructure and strategic business activities.
>
> He holds a Bachelor of Engineering degree in Electrical Engineering from the University of Ilorin; an MSc in Project Management from the University of Cape Town; an MBA in Global Business from the Rotman School of Management, University of Toronto; and a Global Executive MBA from the University of St. Gallen.
>
> Engr. Osamiluyi is a registered engineer with COREN and a Fellow of the NSE (FNSE), the Royal Institution of Chartered Surveyors (FRICS), the NIEEE (FNIEEE) and the NIWE (FNIWE). He is also a member of the Society of Petroleum Engineers (SPE) and the NIM, a Life Member of the Chartered Institute of Directors, and a Fellow of the Institute for Government Research and Leadership Technology.
>
> His achievements and leadership have been recognized through several honours, including the Rotman Executive MBA Fellowship Award for Excellence in an Emerging Market and the Power of Inclusion Leadership Award (Canada). Under his leadership, Sato Engineering has also received notable corporate honours, including the NSE Distinguished Corporate Award for Best Engineering Company in Ogun State, among others.
>
> Beyond his corporate responsibilities, he is actively involved in professional and humanitarian service, including Rotary International, with particular interest in sustainable water, sanitation and infrastructure development.

Notes:
- "Over 32 years" is the client's own figure; it replaces the earlier recalculated figure.
- The postnominals are now FNSE, FRICS, FNIEEE, FNIWE (the deck said FNIEE; the client's bio says FNIEEE, so use that). This resolves the Fellow/Member question from the open-items form.
- Keep the headshot slot with the initials fallback until his photo arrives.
- Remove any leftover award from the old site that this bio supersedes; the NSE corporate award is now in the bio, so don't duplicate it elsewhere (the About page no longer has a Recognition section).

## 9. Unchanged

- HSE stays on hold and unpublished.
- Contact page unchanged except for the compact footer.
- All build gates stay on: banned terms, contact details, placeholders, draft services.

## 10. Open items

Regenerate `docs/open-items.md`:
- **Mudia to confirm with client:** final headings for Energy Services and Oil & Gas Services; updated logo file (requested from the original designer); approval of the bio adaptation in section 1; whether the capability names in the Home/About copy ("Building, Civil Engineering & Infrastructure", "Electro-Mechanical Services") should match the service names used in the nav ("Infrastructure Services", "Electrical Engineering", "Mechanical Engineering"). Right now the client's prose and the nav use different labels; keep his prose verbatim until he decides.
- **Client:** project photos (list of photo-less projects), project content updates, founder headshot, whether to hide project dates.
- **Partner (Part B of the open-items form):** unchanged from prompt 11.
- **On hold:** HSE.

## Done when

- Home shows only the welcome, motto and vision; About shows only the client's text, motto, mission and vision
- Nav: Home · About · Services ▾ · Projects ▾ · Leadership · Contact, with click-to-open dropdowns that work by keyboard
- Services page: intro, five linked headings with photos, Infrastructure and Oil & Gas sub-links, Why Sato grid
- Oil & Gas page: four anchored sections with sticky sub-nav, platform header image, SVG pyramid, value map with text alternative
- Projects: category landing page with three category pages; no single long list; `showProjectDates` works
- Clients: plain lists, out of the main nav, oil and gas list attributed and gated
- Footer ≤ 120px tall on desktop
- `npm run build` passes; banned-terms and contact checks pass with the new bio; renamed routes redirect

Report back with screenshots of Home, About, Services, Oil & Gas, the Projects landing page, one category page, Clients and the footer, at desktop and mobile, plus the updated `docs/open-items.md`.
