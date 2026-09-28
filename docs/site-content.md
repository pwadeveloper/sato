# Site content — Sato Engineering & Infrastructure Limited

**Last reconciled:** 28 September 2026, against the client's third feedback
batch (`docs/decisions/client-feedback-batch-3.md`).

The third batch replaced the Home, About and Services copy with the client's
own wording, split the Technology group, turned Projects into category pages
and cut the Clients page back to a list of names. Where a section below is
marked **verbatim**, it is the client's text and is not to be edited for
tone, length or house style.

## How to use this file

`/content/*.json` is what the site renders. This file is the plain-language
record of **what the copy says and why**, so a change can be argued about
before it is typed into JSON.

Where the two disagree, the JSON is what shipped and this file is stale —
fix it. Where this file disagrees with a decision record in
`/docs/decisions/`, the newest decision record wins.

The detailed body copy for the services still under review is **not
duplicated here**. It lives in `docs/services-for-review.md`, which is the
document the client and his collaborator are marking up.

## Rules that constrain every line below

1. **No country.** "Nigeria", "Nigerian" and "indigenous" appear nowhere. The
   company is extending beyond its first market and will register
   internationally. `npm run check:banned` fails the build on the first two.
2. **No former name, no change of name, no RC number.** Also enforced.
3. **One email and one telephone number** anywhere on the site:
   `info@satoengineering.com` and `+234 803 330 3278`. Also enforced.
4. **No superlative the company cannot prove.** The one exception is the
   mission and vision, which are the client's own approved wording and are
   used verbatim.
5. **Partner work is always attributed.** See "Oil & Gas" below.

---

## Company facts (`site.json`)

- Registered name: Sato Engineering & Infrastructure Limited
- Incorporated: 1997
- Years in operation: 29 (30th anniversary in 2027)
- Offices, in order: **Lagos Office** — No. 14 Agbaoku Street, Opebi, Ikeja,
  Lagos (near Awosika bus stop); **Abeokuta Office** — Abeokuta, Ogun State
  (city and state only; street address awaited, shown without a placeholder)
- Phone: +234 803 330 3278
- Email: info@satoengineering.com
- Professional registrations: COREN-registered engineers on staff; NSE; NIM;
  RICS (founder). Abbreviations only — the full names carry the banned word.
- Oil and gas registrations: empty, section hidden
- Tagline: Quality engineering since 1997

There is **no "head office"**. Every location is an Office, and the display
order is the order of the `offices` array. Adding one is a content edit.

The RC number is held in `site.json` behind `"showRcNumber": false`. Turning
it back on also restores it to the JSON-LD `identifier`.

`showProjectDates` is `true`. Setting it to `false` removes every project
year from the site in one edit.

The **Company at a glance** panel is off Home with the rest of what batch 3
cut. `getCompanyFacts()` and `CompanyFactsPanel` still work and still assemble
registered name, incorporated, years in operation, offices ("Lagos ·
Abeokuta") and professional registrations, for whenever the client wants to
build on the page.

---

## Home

Three things, and nothing else. The client's verdict on the previous version
was that it read as academic; the old site's plainness was closer to what he
wanted. What was on the page — "What we do", the company data plate, the
client strip, selected projects, a closing call to action — is off it. The
components are still in `/components`, unused, because he wants to build on
the page later.

**H1 (verbatim):** Welcome to Sato Engineering & Infrastructure

**Body (verbatim), beside the photograph, not over it:**

> Established in 1997, Sato Engineering & Infrastructure Limited has built
> nearly three decades of experience delivering complex projects and
> integrated solutions across diverse sectors.
>
> Today, we bring together engineering expertise, project management,
> technology and innovation across Building, Civil Engineering &
> Infrastructure, Electro-Mechanical Services, Water Resources Development &
> Management, Energy, Oil & Gas, Digitalization & Digital Twin Services, and
> Research, Technology & Innovation. We remain focused on delivering
> sustainable, high-quality solutions that create lasting value for our
> clients and the communities they serve.

**Motto:** Quality Engineering since 1997

**Vision:** To be a globally recognized engineering and infrastructure
company, renowned for excellence, innovation and world-class project
delivery.

> **Open:** this copy names capabilities — "Building, Civil Engineering &
> Infrastructure", "Electro-Mechanical Services" — that the nav calls
> "Infrastructure Services", "Electrical Engineering" and "Mechanical
> Engineering". A reader meets both within one scroll. The prose stays
> verbatim until the client decides which set of names wins. Flagged in
> `docs/open-items.md`.

---

## About

Single column, one photograph, the client's four paragraphs. "How we work",
"Where we're going", the six-item Recognition list and the call to action are
cut — not relocated. The NSE corporate award now sits inside the founder's
bio on the Leadership page, so it is not duplicated here.

**H1 (verbatim):** About Sato Engineering & Infrastructure

**Body (verbatim):**

> Established in 1997, Sato Engineering & Infrastructure Limited has grown
> from its foundations in engineering and construction into a
> multidisciplinary organization with capabilities spanning infrastructure,
> water resources, electro-mechanical systems, energy, oil and gas, digital
> technologies, and research and innovation.
>
> Over nearly three decades, we have delivered projects for public and private
> sector clients, development institutions and communities, building a track
> record founded on technical expertise, effective project management and
> reliable delivery.
>
> Our capabilities encompass Building, Civil Engineering & Infrastructure,
> Electro-Mechanical Services, Water Resources Development & Management,
> Energy Services, Oil & Gas Services, Digitalization & Digital Twin Services,
> and Research, Technology & Innovation. This breadth enables us to approach
> projects from an integrated perspective, combining established engineering
> practice with technology-driven solutions and emerging innovations.
>
> At the heart of Sato is a team of experienced professionals committed to
> delivering solutions that respond to the evolving needs of our clients and
> the sectors we serve. As infrastructure and industry continue to evolve, we
> continue to strengthen our capabilities and expand the solutions we provide.

**Motto:** Quality Engineering since 1997

**Mission (updated in batch 3, replaces the prompt 10 wording):** To deliver
innovative and sustainable engineering and infrastructure solutions that meet
the highest standards, exceed client expectations and create lasting value.

**Vision:** To be a globally recognized engineering and infrastructure
company, renowned for excellence, innovation and world-class project
delivery.

The change of name is still not mentioned anywhere on the site.

---

## Services

**H1:** Services

**Intro (verbatim):**

> Sato Engineering & Infrastructure Limited delivers integrated engineering,
> infrastructure and technology-driven solutions across a diverse range of
> sectors.
>
> Building on nearly three decades of engineering and project delivery
> experience, we combine multidisciplinary technical expertise, strong project
> management capabilities and evolving technologies to deliver solutions
> tailored to the needs of our clients and the industries we serve.

### The five categories, in order

| # | Category | Route | Shown beneath it |
|---|---|---|---|
| 1 | Infrastructure Services | `/services/infrastructure` | Civil Engineering & Construction · Electrical Engineering · Mechanical Engineering · Water Resources Development & Management |
| 2 | Energy Services | `/services/energy` | — |
| 3 | Oil & Gas Services | `/services/oil-gas` | Capabilities · Solutions · Projects · Partnerships (anchors on the page) |
| 4 | Digitalization & Digital Twin Services | `/services/digital-twin` | — |
| 5 | Research, Technology & Innovation Services | `/services/research-innovation` | — |

The Technology group that held the last two together is gone; they are
top-level services now. **Every heading is a live link** — the client asked
for that after clicking one that did nothing. Each category carries a
photograph, and the rows alternate sides so five near-identical rows do not
read as a table.

Two renames, both with 301s from the old routes:

- "Construction & Civil Engineering" → **Civil Engineering & Construction**
- "Water Resources & Environmental Engineering" → **Water Resources
  Development & Management**. "Environmental" is out of its summary; the
  capabilities are unchanged.

> **Open:** the Energy Services and Oil & Gas Services headings are not
> final — the client is deciding whether one should read "Oil & Gas
> Technology" or similar. Each name lives in one field, so the rename is a
> one-line change plus a redirect. Flagged in `docs/open-items.md`.

### Why Sato? — on the Services page, after the five categories

This answers "why choose you" at the point a visitor is comparing
capabilities, which is where the client's own document put it. Nine points in
a three-column grid, not a column of bullets.

**Lead (verbatim):** Our strength is built on decades of engineering
experience, technical capability and a consistent commitment to delivering
quality and value.

Proven engineering and project delivery experience · Multidisciplinary
technical capabilities · Strong project management capabilities · Quality and
timely delivery · Reliability and dependability · Integrity and professional
responsibility · Client-focused approach · Commitment to sustainable
solutions and lasting value · Established track record and reputation

### Infrastructure Services landing page

**Intro:** "Our established infrastructure practice, delivering since 1997."
Then: our scope covers all aspects of civil engineering design and
construction — roads, dams, irrigation development, buildings and water
resources development. *(Taken from the live site's welcome text.)* Then a
note that the four disciplines are delivered by the same teams, and most
contracts draw on more than one.

Each discipline shows its photograph, its summary, a "Full capability" link
to its own page, and its first five capabilities. Two of the four were
renamed in batch 3 — Civil Engineering & Construction, and Water Resources
Development & Management — and both old routes 301.

### Oil & Gas Services

**Draft. Needs Sato's approval and his collaborator's.** Full text in
`docs/services-for-review.md`.

The page is **four anchored sections with a sticky sub-nav** — Capabilities ·
Solutions · Projects · Partnerships — driven by `sectionNav` in
`services.json`, which also supplies the sub-items under Oil & Gas in the
header menu and on the services overview.

| Section | Holds |
|---|---|
| Capabilities | the overview paragraphs, the three capability areas, "also covered" |
| Solutions | the technology solutions, in three groups with descriptions; the solutions pyramid; the business value map; equipment sourcing and procurement |
| Projects | a short block linking on to `/projects/oil-gas`, where the record now lives |
| Partnerships | the partner team description, the recognition, the partner name block |

The Projects **section** stays, and keeps its `#projects` anchor and its
sub-nav item, but both now point at `/projects/oil-gas` — the table, the
wider engagements and the case study moved there with the rest of the
project record. The anchor is deliberately kept so an existing
`/services/oil-gas#projects` link still lands on the block that carries the
onward link.

**Solutions is three groups**, two columns on desktop: Subsurface and
seismic · Field development and reservoir management · Production and
facilities. Five of the thirteen items carry a one-sentence description
taken from the technical partner's own service pages and edited into Sato's
voice; the sources are listed in `docs/services-for-review.md`.

**Two diagrams from the collaborator's deck:**

- **The solutions pyramid is rebuilt as inline SVG** from data in
  `services.json`, so it scales, takes the brand ramp instead of the deck's
  primary colours, and its contents are real text. The bands are **numbered**
  rather than named — "Transformation" is wider than the apex band at any
  legible size — and the names and their items sit beneath as a keyed legend.
  The source's "Surveilance" is spelled correctly.
- **The business value map uses the source image.** It is a dependency graph
  with crossing edges, and a hand-made version would either lose the
  crossings, which are the point, or cost more to keep true than it is worth.
  It scrolls horizontally on a phone and carries the same content beneath it
  as a real table inside a `<details>` — that table is the only version a
  screen reader can use, so it is load-bearing, not a courtesy.
- The deck's world maps and revenue charts are **not** used: map licensing,
  and the partner's figures are unconfirmed.

**Header image:** the green-tinted platform photograph, with the heading over
its pale left arc. Two scrims hold the contrast — a horizontal wash from `md`
up where the copy is in the left column, a flat one below it where the copy
runs full width. Measured worst case 7.9:1.

The one thing to hold onto: **the page keeps two track records apart.**
Capabilities, solutions and procurement are written as what Sato offers.
Every past project, figure, patent, case study and award belongs to the
technical partner, sits under "Experience of our partner team", and is
attributed on the page. None of it appears on the Projects pages, in Sato's
project counts or in the structured data.

Not published, deliberately:

- **The partner's name** — `partner.name` empty, line hidden.
- **The headline figures** — the source contradicts itself (170 / 250+ / 280+
  projects; 6 / 8 patents; 13 / 15 countries). `partner.figures` empty, strip
  hidden.
- **"100% on budget / on schedule"** and **"+10–200% profit, 1000% ROI"** —
  unverifiable, and a procurement team discounts them on sight. Recorded in
  `docs/services-for-review.md` as omitted, restorable on request.

The page cross-links to Digitalization & Digital Twin, since much of the
work is digital.

**CTA:** Discuss your field, asset or procurement requirement with our team.

---

## Projects

**Category pages, not a filtered list.** The client's objection to the filter
was that someone who came for water work had to scroll past buildings and
roads to reach it, and that whole categories were being missed — which is
what a filter does when nobody notices it is there.

`/projects` is a short line and four large photographic tiles, each with its
project count. No project list on it.

| Category | Route | Projects |
|---|---|---|
| Buildings & Construction | `/projects/buildings-construction` | 21 |
| Civil Engineering & Roads | `/projects/civil-engineering-roads` | 9 |
| Water Resources Development & Management | `/projects/water-resources-development-management` | 11 |
| Oil & Gas | `/projects/oil-gas` | 26 |

The first three show their projects as image-led cards. **Oil & Gas is a
table**, because its rows are client, project and year with no scope, no
photographs and no detail page — the "Show all" disclosure opens the rows
past the first eight, and the wider engagements and the case study follow it.
Every category page ends with a small "Other categories" row. The breadcrumb
on a project runs Projects › Category › Project. Old `?sector=` URLs redirect
to the matching category, and the ~39 old-site deep links that pointed at a
filtered URL now point straight at the category page.

**Every project on the site is here.** No service page lists projects; each
links out to its category instead ("See our Buildings & Construction
projects"). Energy, Digital Twin and Research have no category yet and show
no link.

**The Oil & Gas projects are the technical partner's, presented as Sato's
own on the client's instruction of 28 September 2026.** They are not counted
into Sato's 41. The reservation, and the request that both parties confirm
it before publication, is in `docs/services-for-review.md`.

41 projects, unchanged in substance from the previous pass. Status is only
ever "Completed" or empty; the site never labels work as ongoing. `client`,
`location` and `year` are hidden when empty, never placeheld.

**Dates are behind a switch.** `showProjectDates` in `site.json` is `true`;
setting it to `false` removes every year from every card, category page and
project page in one edit. The client may want that later.

**28 of 41 projects have no photograph.** Their card shows a plain panel with
the brand rule rather than the category name set at display size — on a
category page every card would otherwise carry the same word a dozen times
over. The full list by category is in `docs/open-items.md`; the client said
he would work on project content.

Four projects still have no year: APM Terminals Reefer Pavement, the E-WASH
bulk meters, the FUNAAB Administrative Block and the Ajebo asphaltic concrete
road. The live site does not have them either.

---

## Clients

**A list of names, and not a focal point** — the client's instruction. Out of
the main nav; reached from the footer and from the foot of the Projects
landing page ("Clients we've worked with").

No logos, no descriptions, no category headings, and no agencies nested under
a government — the parent body stands as the single entry, so "Ogun State
Government" appears once rather than heading a list of six of its agencies.
19 entries, in columns.

**A second, clearly separated list** follows, under the heading, exactly:

> Oil & Gas: clients served through our technical partners

ADNOC · ADNOC Gas · Al Dhafra · Kuwait Oil Company · Chevron · Ecopetrol ·
Pacific Rubiales · Santos · Halliburton · Vaalco · Saudi Aramco · Pemex ·
PDVSA · Repsol · US Bureau of Land Management · E3 Lithium · Enrema

These are the partner team's clients, not Sato's direct clients, and the
heading says so before the first name. The block is behind the same review
gate as the Oil & Gas page: while that service is `draft`, the production
build is blocked and neither can go live without the other.

---

## Leadership

**Engr. Wale Osamiluyi, FNSE, FNIEEE, FNIWE, FRICS** — Founder & Managing
Director. The only published person. The bio is the client's own, in five
paragraphs, covering his degrees, his memberships including SPE, his honours
and his service with Rotary International.

Two things settled by batch 3, unchanged:

- **FNIEEE, not FNIEE.** The deck said FNIEE; the client's own bio says
  FNIEEE, so FNIEEE it is.
- **"Over 32 years"** is the client's own figure and replaces the earlier
  recalculated one.

**Batch 4 replaced the bio with the client's own version, verbatim**, and
reordered the postnominals to match it — engineering fellowships first, RICS
last. The earlier adapted version, which used COREN / NSE / NIEEE / NIWE /
NIM and dropped the country from each university, is gone.

**This is the site's only exemption from the no-country rule.** The client
asked for every institution to be named in full, country included, so a
reader knows where each university is. The bio is wrapped in
`data-allow-country="true"` on `/leadership` alone, and
`npm run check:banned` skips the country pattern inside that element and
nowhere else. The page's own title, meta description, Open Graph tags and
JSON-LD are still scanned and still fail on a country name — the meta
description is deliberately written without one: "Engr. Wale Osamiluyi,
Founder & Managing Director of Sato Engineering & Infrastructure Limited."
The attribute appearing on any other page fails the build, which is why
`/styleguide` shows a made-up sample person rather than the real record.

**One wording suggestion is open**, not applied: the third paragraph reads
"a member of the Society of Petroleum Engineers (SPE), Nigerian Institute of
Management, a Life Member…", where "and the" before "Nigerian Institute of
Management" would read better. It is his text; it stays as written until he
says otherwise. See `docs/open-items.md`.

The separate qualifications and memberships lists are empty, because the bio
now carries both in prose and printing them twice on one page says nothing
the second time.

No contact details on this page. The headshot slot uses the initials block
until a photograph arrives.

Below the founder: how project teams are assembled. Everyone else in
`team.json` is `published: false` — off the site, the sitemap and the
structured data.

---

## HSE & Quality — on hold

**Not built, not linked, not in the sitemap.** `/hse` and the old
`/safety-policies/` redirect to `/about`. Held until Sato reviews it with his
oil and gas collaborator.

The content is kept, rewritten from the live safety policy, in
`content/pages/hse.json`: committed to managing safety, quality and
environmental matters professionally; people are the most valuable asset and
the first aim is preventing work-related injuries; its own safety management
system (corporate standards, management plans, implementation guidelines),
implemented on every project and audited internally every three months;
monthly general and project-specific inductions; PPE provided as required,
minimum safety helmet and safety boots.

---

## Contact

**H1:** Contact us
**Intro:** For project enquiries, tenders and vendor verification, contact our
team. *(No longer "our head office".)*

Offices, phone and email render from `site.json`. Form fields: name,
organisation, email, phone, subject (Project enquiry / Tender or vendor
registration / General), message. `contactFormEndpoint` is empty, so the form
falls back to composing a `mailto:` in the visitor's own client.

---

## Footer

**One compact band**, under 120px on desktop (currently 84px), three short
lines on a phone. The client's note was that the bottom of every page had
become the biggest thing on it.

| Left | Middle | Right |
|---|---|---|
| Sato Engineering & Infrastructure Limited · © {current year} | About · Services · Projects · Clients · Contact | +234 803 330 3278 · info@satoengineering.com |

The logo, the "Incorporated 1997" line and the separate copyright row are
gone. Clients is in the footer because it is out of the main nav.

## Navigation

**Home · About · Services ▾ · Projects ▾ · Leadership · Contact.** "Home" is
an explicit item as well as the logo link; Clients has moved to the footer.

Services and Projects open on **click**, not hover: tap or click to open, all
sub-items shown at once, close on Escape, on an outside click or on choosing
an item. Enter and Space open the panel, arrow keys walk it, Home and End
jump to its ends, and closing returns focus to the trigger. One component
(`NavMenu`) serves both, on desktop and in the phone panel.

---

## Equipment

There is no Equipment page — removed on the client's instruction.
`equipment.json` stays in the repo, and `/equipment` and `/equipments`
redirect to `/about`. The fleet is described in prose on About instead.
