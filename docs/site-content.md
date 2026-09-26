# Site content — Sato Engineering & Infrastructure Limited

**Last reconciled:** 26 September 2026, against the client's second feedback
batch (`docs/decisions/client-feedback-batch-2.md`) and a fresh pass over the
live site at satoengineering.com.

## How to use this file

`/content/*.json` is what the site renders. This file is the plain-language
record of **what the copy says and why**, so a change can be argued about
before it is typed into JSON.

Where the two disagree, the JSON is what shipped and this file is stale —
fix it. Where this file disagrees with a decision record in
`/docs/decisions/`, the newest decision record wins.

The detailed body copy for the six services still under review is **not
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

**Company at a glance** panel renders: registered name, incorporated, years in
operation, offices ("Lagos · Abeokuta"), professional registrations.

---

## Home

**Hero headline:** Engineering infrastructure since 1997.

**Hero subhead:** Sato Engineering & Infrastructure Limited designs and
delivers infrastructure, energy, and oil and gas engineering services. Since
1997 we have built roads, dams, water schemes and buildings for governments,
universities, international development partners and private clients.

**CTAs:** Explore our work → /projects; Contact us → /contact

**What we do** — the four service categories, in order: Infrastructure
Services (four disciplines listed), Energy Services, Oil & Gas Services,
Technology (two listed). A category holding one service shows that service's
one-liner rather than a list repeating its own name.

**Trusted by:** the featured clients from `clients.json`.

**Selected projects:** the `featured: true` projects, lead card first.

**Closing CTA:** Working on a project in infrastructure, energy or oil and
gas? Talk to our team.

---

## About

**H1:** About Sato

**Intro:** Sato Engineering & Infrastructure Limited was established in 1997.
For nearly three decades we have delivered civil engineering design and
construction across roads, dams, irrigation, buildings and water resources,
for clients ranging from government ministries to international development
partners. Today our work spans infrastructure, energy, and oil and gas.

**"Our new name" has been deleted.** The change of name is not mentioned
anywhere on the site.

**How we work:** dedicated team per project drawn from a core leadership group
and a pool of engineers, technicians, foremen and specialists. Sato owns and
operates a large fleet of plant, machinery and tools, including its own
borehole drilling rig, so it mobilises quickly and controls quality on site.
*(Fleet wording taken from the live Future Plans page.)*

**Where we're going:** extending the same capability across Africa and
beyond, with the intention of registering internationally; working towards
highway, airport, railway and hydro-electric power projects. Two sentences,
no countries named — the first registration outside the current market is not
in place and the site must not get ahead of it. *(From the live Future Plans
page, with "Nigeria" and the expansion-city list removed.)*

**Mission and vision:** the client's approved wording, verbatim, superlatives
included.

**Recognition — six awards.** The awarding bodies for the two 2012 awards were
recovered from the live site. The "Nigerian Society of Engineers" is written
as "NSE".

> **One award was removed.** "Most Supportive Indigenous Company (2012), Egba
> Youths Awards" is dropped, because its official title contains a word the
> company no longer uses and paraphrasing it would misquote the award. Flagged
> in `docs/open-items.md` for the client to overrule.

---

## Services

**H1:** Services

**Intro:** Four service categories, one standard of delivery. Every one draws
on the same project management, plant and delivery systems Sato has built
since 1997.

### The four categories, in order

| # | Category | Route | Contains |
|---|---|---|---|
| 1 | Infrastructure Services | `/services/infrastructure` | Construction & Civil; Electrical; Mechanical; Water Resources & Environmental |
| 2 | Energy Services | `/services/energy` | — |
| 3 | Oil & Gas Services | `/services/oil-gas` | — |
| 4 | Technology | — | Digitalization & Digital Twin; Research, Technology & Innovation |

The group formerly called "Engineering" is now **Infrastructure Services**
everywhere. Technology is unchanged and may be split later.

### Infrastructure Services landing page

**Intro:** "Our established infrastructure practice, delivering since 1997."
Then: our scope covers all aspects of civil engineering design and
construction — roads, dams, irrigation development, buildings and water
resources development. *(Taken from the live site's welcome text.)* Then a
note that the four disciplines are delivered by the same teams, and most
contracts draw on more than one.

Each discipline shows its summary, a "Full capability" link to its own page,
and its first five capabilities. The four detail pages and routes are
unchanged.

### Oil & Gas Services

**Draft. Needs Sato's approval and his collaborator's.** Full text in
`docs/services-for-review.md`.

The one thing to hold onto: **the page keeps two track records apart.**
Capabilities, solutions and procurement are written as what Sato offers.
Every past project, figure, patent, case study and award belongs to the
technical partner, sits inside a section headed "Experience of our partner
team", and is attributed on the page. None of it appears on the Projects
page, in Sato's project counts or in the structured data.

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

Filters mirror the service structure: **All · Infrastructure Services**
(sub-filters Buildings, Roads & Pavements, Water) **· Energy Services · Oil &
Gas Services**. A category appears only once it has at least one Sato project,
so only Infrastructure Services shows today.

**Partner projects never appear here.**

41 projects, reconciled against the live site's three project tables on
26 September 2026 — no additions were needed. Status is only ever
"Completed" or empty; the site never labels work as ongoing. `client`,
`location` and `year` are hidden when empty, never placeheld.

Four projects still have no year: APM Terminals Reefer Pavement, the E-WASH
bulk meters, the FUNAAB Administrative Block and the Ajebo asphaltic concrete
road. The live site does not have them either.

---

## Clients

Unchanged from the previous pass, and complete against the live site's list.
19 entries across federal, state, international, education and private, with
sub-units named where a ministry engaged Sato through an agency.

---

## Leadership

**Engr. Wale Osamiluyi, FNSE, FNIEE, FNIWE** — Founder & Managing Director.
The only published person. The 2012 bio is kept, with professional bodies
written as abbreviations, until he sends updated details.

> **Unresolved:** the display name says Fellow (FNSE), the carried-over bio
> says Member (MNSE, MNIM), and FNIEE and FNIWE are not in the memberships
> list. The two contradict each other on the same page. Flagged in
> `docs/open-items.md`.

No contact details on this page.

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

Sato Engineering & Infrastructure Limited. Incorporated 1997.
Links: About, Services, Projects, Clients, Contact.
© {current year} Sato Engineering & Infrastructure Limited.

---

## Equipment

There is no Equipment page — removed on the client's instruction.
`equipment.json` stays in the repo, and `/equipment` and `/equipments`
redirect to `/about`. The fleet is described in prose on About instead.
