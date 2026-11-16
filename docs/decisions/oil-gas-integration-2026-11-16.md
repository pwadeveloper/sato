# Oil & Gas integration (16 November 2026)

**Current. Wins where it conflicts with anything earlier.**

The source is the oil and gas brief and its claims register, built from the
client's company-profile deck and the calls of 8, 11, 12 and 16 November.
Both are confidential, so they are kept out of git, in `_brief/`
(gitignored). This file records what was decided and done. It does not
repeat the register.

## Direction

The site reads as one engineering, infrastructure and energy group. Oil and
gas is a core capability, and Sato delivers it **with its consortium**:
specialist upstream partners, who stay unnamed for now. Two rules hold
everywhere:

- **Oil and gas experience belongs to "our consortium".** No bare "we"
  claims Sato delivered it alone.
- **Sato's dates stay with Sato's own work.** "Since 1997" and "nearly three
  decades" never sit next to an oil and gas claim, and the stat strips
  label whose figures are whose.

## Decisions taken with the brief (D1 to D10 in the local plan)

1. **Oil and gas years stay off.** The client's earlier ruling stands, and
   `check:dates` enforces it. The record is still ordered newest first, so
   turning `showProjectDates` on is the whole change. The timeline in the
   brief is deferred, because it is built from years.
2. **Two office lines are allowed:** Lagos and the new Canada office.
   `check:banned` holds both and still fails any other number.
3. **The services are in two groups, Infrastructure and Energy.** Energy
   holds Oil & Gas, Energy Services, Digital Twin and Research, in that
   order. The Services and Projects menus are two-column mega-menus, and Oil
   & Gas keeps its three anchors as sub-items.
4. **Projects mirrors Services**, except that the Energy group shows only
   Oil & Gas. The other three categories have no projects, and an empty
   category is still never published. They are not pointed at the oil and
   gas record, because it is not their work.
5. **The four Infrastructure labels of 9 November are kept** as they are.
6. **A university-partnerships line is back**, credited to the consortium,
   in Partnerships on the Oil & Gas page. It is flagged for the client.
7. **The "Technology solutions" list and the "Also covered" aside are
   removed** from Oil & Gas. Neither is in the register. The old copy is in
   git history.
8. **The footer gains an Oil & Gas link**, and no addresses.
9. **Stoic and Cradle sit under "Other engagements"**, with no "ongoing"
   wording.
10. **The founder's bio in `content/team.json` is untouched.** The built
    site has no country name, which `check:banned` enforces. The source
    files still do, deliberately, as before.

The Oil & Gas sub-nav hold and the Lagos address hold are both honoured.
The sub-nav still derives to Capabilities · Solutions · Projects ·
Partnerships, and the new deck sections sit inside them.

## What changed

- **`/services/oil-gas`** follows the deck's order and keeps the deck's
  wording.
  - The header carries the slide 2 lead and the consortium's figures (a
    labelled `StatStrip`).
  - **Our consortium** (`service.overview`) comes next, then Capabilities
    (three pillars and the value map).
  - The value map is now **drawn as HTML** from its rows. The deck raster
    is gone.
  - Solutions holds: How the system works (`FlowDiagram`, at the level of
    stages only), From data to action (`CycleDiagram`), the pyramid, APM
    (`FlowDiagram`), Why our consortium, the frameworks statement, and the
    published SPE and OTC results with their references (`ResultsGrid`).
  - Then come Procurement, and Partnerships with **One group, two
    strengths**. This is `backed-by-oil-gas` in `pages/services.json`, and
    it replaces "Backed by Sato" on that page only.
- **`/projects/oil-gas`**: the attribution line ("Delivered by our
  consortium."), then Results at a glance, then use cases, then the project
  record.
  - The record is grouped by region (`partner.regions`, each row's
    `region`), followed by patents in their own table and the wide-scope
    engagements.
  - Results at a glance reuses records by id
    (`partner.highlightResultIds`, each use case's `featuredResultIds`). No
    wording is copied.
- **Use cases are a collection**, `content/use-cases.json`, rendered at
  `/projects/oil-gas/[slug]` by `components/UseCaseLayout.tsx`. A new use
  case is one entry. The client stays anonymised (`clientDisplay`), and
  `todo` holds editor notes that nothing renders. The old
  `partner.caseStudy` is gone.
- **Home**:
  - The hero carries the full name over "Engineering, infrastructure and
    upstream energy", with Infrastructure and Oil & Gas CTAs.
  - Two equal pillars follow.
  - The figures are a `StatStrip` in two labelled groups (Sato, Our
    consortium).
  - A featured use case, then two labelled client rows and the CTA "Discuss
    your field, asset or project".
- **About** gains "How we deliver: Sato and our consortium".
- **Clients**: the oil and gas block heading is "Oil and gas clients served
  by our consortium", and Al Hosn Gas is added.
- **Contact** gains the Canada office, a phone line under each office, and
  an enquiry-type selector.
- **OG cards**: `npm run og -- --pages` writes `oil-gas.png` and one card
  per published Oil & Gas use case, from the content.

## Still open

The questions for the client and the consortium lead are kept in
`_brief/REPORT.md`. They cover:

- which figures and names may be cited;
- whether ADNOC may be named beside the use case;
- the deferment figure that is on hold;
- the undefined acronyms;
- the partners' names;
- a named contact;
- further use cases.
