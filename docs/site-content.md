# Site content — Sato Engineering & Infrastructure Limited

**Last reconciled:** 29 September 2026, against the two client review calls
(`docs/decisions/client-review-calls.md`).

That round made Projects mirror Services one category per service, took the
Recognition block off Oil & Gas and the vision off Home, emptied the footer
of contact details, put a photograph beside the About story and added the
Abeokuta street address. Three things in it are **on hold** and must not be
changed: the Oil & Gas in-page sub-nav, the Lagos address format and the
Leadership page. Where a section below is marked **verbatim**, it is the
client's text and is not to be edited for tone, length or house style.

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
  Lagos (near Awosika bus stop); **Abeokuta Office** — IBB Boulevard, opposite
  Southwest Resource Centre, Oke-Mosan, Abeokuta, Ogun State
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

Two things, and nothing else. The client's verdict on the previous version
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

**The vision is off Home.** It used to sit here on its own; the client's point
on the review call was that the mission and the vision belong together and
that both are already on About. Home ends at the motto.

Both statements are still held in `pages/home.json`, and
`homeShowMissionVision` in `site.json` puts them back **as a pair** below the
motto in one edit. Never one without the other — that is the thing he asked us
not to do.

> **Open:** this copy names capabilities — "Building, Civil Engineering &
> Infrastructure", "Electro-Mechanical Services" — that the nav calls
> "Infrastructure Services", "Electrical Engineering" and "Mechanical
> Engineering". A reader meets both within one scroll. The prose stays
> verbatim until the client decides which set of names wins. Flagged in
> `docs/open-items.md`.

---

## About

The client's four paragraphs, set beside a photograph of delivered work from
`lg` up: seven columns of prose, five of picture, top-aligned with the first
paragraph and sticky so the right-hand side is not empty by the fourth. Below
`lg` the photograph sits above the text at a moderate height. The picture is
the completed road at the Federal College of Education, Osiele, and it is a
placeholder for one of the client's own photographs when they arrive.
"How we work",
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
| 3 | Oil & Gas Services | `/services/oil-gas` | Capabilities · Solutions · Partnerships (anchors on the page; "Projects" is deliberately not listed here — see Navigation) |
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

The page is **three anchored sections and a link out**, under a sticky sub-nav
of four — Capabilities · Solutions · Projects · Partnerships — driven by
`sectionNav` in `services.json`.

| Section | Holds |
|---|---|
| Capabilities | the overview paragraphs, the three capability areas, "also covered" |
| Solutions | the technology solutions, in three groups with descriptions; the solutions pyramid; the business value map; equipment sourcing and procurement |
| Projects | nothing on this page — the sub-nav item goes straight to `/projects/oil-gas` |
| Partnerships | the partner team description and the partner name block |

**There is no Projects block on the page.** The table, the wider engagements
and the case study moved to `/projects/oil-gas`, and for a while a stub
stayed behind — a heading, the category line and one link — to hold the
`#projects` anchor. The client's verdict was that a heading over one link is
not a section, and it is gone. An old `/services/oil-gas#projects` link now
lands at the top of the page instead of on that block, which is the trade he
chose.

**The in-page sub-nav still lists all four**, and its Projects item points at
`/projects/oil-gas`. The client asked for the sub-nav itself to stay as it is
until he has discussed it — **on hold, do not remove the Projects item.** The
*menu* copies of it did come off: the Services dropdown and the services
overview no longer list "Projects" under Oil & Gas, because Projects is a
top-level nav item and both pointed at the same page.

All of this is one rule in the template, not a special case for this page: a
`sectionNav` entry that carries an `href` is a destination rather than a part
of the page, so the page renders no section and no anchor for it and the two
menus leave it out.

**The Recognition block is gone** — the 2015 SPE International Projects,
Facilities and Construction Award and the university partnerships in the USA
and Canada. It is not Sato's recognition, and a reader on a Sato page has no
way to tell that from an award line. Removed on the client's instruction; the
Partnerships section keeps the partner team description and the still-hidden
partner name.

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
  It is drawn at **80% of the page width, centred** — the client said it
  forced too much scrolling, and the source is nearly square, so a fifth off
  the width is a fifth less page. Measured 946px of a 1184px column at 1440.
  It still scrolls horizontally on a phone, where it is floored at 40rem
  because below that the 9pt labels stop being readable, and it carries the
  same content beneath it as a real table inside a `<details>` — that table is
  the only version a screen reader can use, so it is load-bearing, not a
  courtesy.
- The deck's world maps and revenue charts are **not** used: map licensing,
  and the partner's figures are unconfirmed.

**Header image:** the green-tinted platform photograph, with the heading over
its pale left arc. Two scrims hold the contrast — a horizontal wash from `md`
up where the copy is in the left column, a flat one below it where the copy
runs full width. Measured worst case 7.9:1.

The one thing to hold onto: **the page keeps two track records apart.**
Capabilities, solutions and procurement are written as what Sato offers. The
past projects, figures, patents and case study belong to the technical
partner: they live in the `partner` block, they are attributed wherever they
appear — including at the head of `/projects/oil-gas` — and none of them
reaches Sato's project counts or the structured data.

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

**Projects mirrors Services.** The categories are the services, with the same
names and in the same order, grouped the same way. The client's instruction on
the review call was that a reader who has found a service should not have to
learn a second taxonomy to find its work — and before that, that a filter
nobody notices is how whole categories get missed.

`/projects` is a short line and one photographic tile per category, each with
its project count, under the same headings the Services dropdown uses. No
project list on it.

| Group | Category | Route | Projects |
|---|---|---|---|
| Infrastructure Services | Civil Engineering & Construction | `/projects/civil-engineering-construction` | 30 |
| Infrastructure Services | Electrical Engineering | `/projects/electrical-engineering` | 2 |
| Infrastructure Services | Mechanical Engineering | — | 0, hidden |
| Infrastructure Services | Water Resources Development & Management | `/projects/water-resources-development-management` | 11 |
| — | Energy Services | — | 0, hidden |
| — | Oil & Gas Services | `/projects/oil-gas` | 26 |
| — | Digitalization & Digital Twin Services | — | 0, hidden |
| — | Research, Technology & Innovation Services | — | 0, hidden |

**A category with no projects is not published** — not in the dropdown, not on
the landing page, not in the sitemap, and no route file exists for it. Each
appears automatically the moment its first project lands. The client's partner
is sending projects for Digital Twin and Research; those will be partner work,
attributed, behind the same review gate as Oil & Gas.

**Civil Engineering & Construction keeps two subheadings** — "Buildings" and
"Roads & Pavements" — because the merge of the old Buildings and Roads
categories put thirty projects on one page and neither half should be buried.

The card categories show their projects as image-led cards. **Oil & Gas is a
table**, because its rows are client, project and year with no scope, no
photographs and no detail page — the "Show all" disclosure opens the rows
past the first eight, and the wider engagements and the case study follow it.
Every category page ends with a small "Other categories" row. The breadcrumb
on a project runs Projects › Category › Project.

**A project can sit in more than one category.** The two bulk meter supplies —
USAID E-WASH, and World Bank / Federal Ministry of Water Resources — are Water
Resources work and Electrical Engineering work, and appear under both. Their
detail page names the second category under "Also in".

Old `?sector=` URLs redirect to the matching category;
`/projects/buildings-construction` and `/projects/civil-engineering-roads`
301 to `/projects/civil-engineering-construction`, as does every old-site deep
link that pointed at either.

**Every project on the site is here.** No service page lists projects; each
links out to its category instead ("See our Civil Engineering & Construction
projects"), and only when that category is published.

**The Oil & Gas projects are the technical partner's, and are attributed as
such**: "Delivered by our technical partner team." heads the page. The line
came off on the client's instruction of 28 September 2026 and went back on
with the review calls, which ask that partner work be attributed
automatically. They are not counted into Sato's 41. The reservation, and the
request that both parties confirm it before publication, is in
`docs/services-for-review.md`, and the reversal is flagged for the client in
`docs/open-items.md`.

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

**The client's photographs of completed work** go in beside the services
rather than the projects: each service may carry an `images[]` gallery, fed by
`raw-assets/client-photos/<service>/` and `npm run images`. The steps are in
`docs/adding-client-photos.md`. Nothing is mapped yet — no photographs have
arrived.

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

Offices, phone and email render from `site.json`, and since the review calls
this is the **only** page that carries the phone number and the address.

**Offices, verbatim:**

> **Lagos Office** — No. 14 Agbaoku Street, Opebi, Ikeja, Lagos
> *Near Awosika bus stop.*
>
> **Abeokuta Office** — IBB Boulevard, opposite Southwest Resource Centre,
> Oke-Mosan, Abeokuta, Ogun State

The Abeokuta street address is from the live site's contact page, which sets
it over three lines as "IBB Boulevard / Opposite Southwest Resource Centre, /
Oke-Mosan, Abeokuta, Ogun State." — the same words, joined with commas for a
single-line field.

**On hold: the Lagos address format.** The client talked about showing the
area and a nearby bus stop in brackets, the way the live site does ("No 14
Agbaoku street (Awosika bus stop), Opebi, Ikeja, Lagos State."). The contact
page is being revisited on the next call, so nothing here changes until then;
the bus stop is currently a separate note line under the address.

The live site's two other telephone numbers (+234 039-771162 and
+234 8055023792) are **not** used. One number and one address are all the site
may carry, and `npm run check:banned` fails the build on any other.

Form fields: name, organisation, email, phone, subject (Project enquiry /
Tender or vendor registration / General), message. `contactFormEndpoint` is
empty, so the form falls back to composing a `mailto:` in the visitor's own
client.

---

## Footer

**One compact band**, under 120px on desktop (currently 84px), three short
lines on a phone. The client's note was that the bottom of every page had
become the biggest thing on it.

| Left | Right |
|---|---|
| Sato Engineering & Infrastructure Limited · © {current year} | About · Services · Projects · Clients · Contact |

The logo, the "Incorporated 1997" line and the separate copyright row are
gone. Clients is in the footer because it is out of the main nav.

**The telephone number and the email address are not in the footer.** They
came out on the client's instruction: the contact details live on `/contact`,
which is one of the five links beside them. They are unchanged in `site.json`
and still in the structured data, so a search engine still has them.

## Navigation

**Home · About · Services ▾ · Projects ▾ · Leadership · Contact.** "Home" is
an explicit item as well as the logo link; Clients has moved to the footer.

Services and Projects open on **click**, not hover: tap or click to open, all
sub-items shown at once, close on Escape, on an outside click or on choosing
an item. Enter and Space open the panel, arrow keys walk it, Home and End
jump to its ends, and closing returns focus to the trigger. One component
(`NavMenu`) serves both, on desktop and in the phone panel.

**The two panels have the same shape.** Services lists its five categories,
Infrastructure's four disciplines indented under it. Projects lists the
categories that have projects, grouped the same way — Infrastructure Services
as a plain heading (there is no `/projects/infrastructure` for it to link to)
with its disciplines under it, then the rest at the top level.

**Nothing appears in two menus.** "Projects" is gone from the Oil & Gas
sub-items in the Services panel and from the Oil & Gas sub-links on the
Services page: it pointed at `/projects/oil-gas`, which Projects already
lists. The rule is general — a `sectionNav` entry that carries an `href`
belongs to another page and is left out of both menus — and the Oil & Gas
page's own in-page sub-nav is untouched.

---

## Equipment

There is no Equipment page — removed on the client's instruction.
`equipment.json` stays in the repo, and `/equipment` and `/equipments`
redirect to `/about`. The fleet is described in prose on About instead.
