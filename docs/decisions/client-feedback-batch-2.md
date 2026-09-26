# Prompt 11 — Client feedback batch (call + oil & gas deck)

This is one batch of changes from a client call and a confidential company deck. Implement all of it in one pass. **Where this file conflicts with CLAUDE.md, docs/site-content.md, prompt 10 or any earlier prompt, this file wins.** Update CLAUDE.md and docs/site-content.md to match, and save this file as `docs/decisions/client-feedback-batch-2.md`.

The oil and gas content below has already been extracted from the confidential deck. **The deck itself must not be added to this repo.** Nothing in this prompt contains personal contact details; keep it that way (section 12).

Start by giving me a short plan: files changed, routes added, removed or hidden, and anything that conflicts. Then proceed.

---

## 1. Remove "Nigeria" from the site entirely

The company plans to operate outside Nigeria (starting with Kenya) and will register internationally later. The site must not read as a Nigeria-only company.

- The words **"Nigeria" and "Nigerian" must not appear anywhere in the built site**: visible copy, headings, page titles, meta descriptions, alt text, Open Graph image, JSON-LD, sitemap, 404 page, footer.
- **Remove every mention of the former name** ("Sato Engineering Nigeria Limited" and "formerly …"). Delete the About page "Our new name" section entirely, remove `alternateName` from JSON-LD, and remove the former name from the Company at a glance panel and footer. Don't mention the name change anywhere.
- **Remove the RC number from the site.** Delete the footer line "formerly Sato Engineering Nigeria Limited. RC 317208" and the RC row from the Company at a glance panel. Keep `rcNumber` in site.json with `"showRcNumber": false` so it can be restored.
- Rewrite copy that relied on the word:
  - Hero headline: "Engineering infrastructure since 1997." (replaces "Engineering Nigeria's infrastructure since 1997.")
  - "an indigenous Nigerian engineering firm" → "an engineering and infrastructure company". Drop "indigenous" everywhere as well; it carries the same implication.
  - Hero subhead: "Sato Engineering & Infrastructure Limited designs and delivers infrastructure, energy, and oil and gas engineering services. Since 1997 we have built roads, dams, water schemes and buildings for governments, universities, international development partners and private clients."
  - Professional bodies in the founder's bio: use abbreviations only (COREN, NSE, NIM), not the full names that contain "Nigeria".
  - Any location written as "…, Nigeria": drop the country and keep the city/state.
- JSON-LD: omit `addressCountry`. Keep the phone number (+234) as is.
- **Add an automated check:** extend `scripts/check-placeholders.mjs` (or add `scripts/check-banned-terms.mjs`, run by `npm run build:prod`) to scan the exported `/out` HTML, and fail on `/nigeria/i`, `formerly`, and `317208`.

Company name stays exactly: **Sato Engineering & Infrastructure Limited** (with "&"; confirmed by the client's form and deck).

## 2. Offices

- Drop the "Head Office" label. Every location is just "Office".
- Order: **Lagos first**, then Abeokuta.
  - Lagos Office: No. 14 Agbaoku Street, Opebi, Ikeja, Lagos
  - Abeokuta Office: Abeokuta, Ogun State (street address to follow; show city and state only, no placeholder)
- Space for one or two more offices to be confirmed. The old site mentions Ibadan and Abuja; **don't show them** until the client confirms. Make offices an ordered array in site.json so adding one is a content edit.
- Phone: +234 803 330 3278. Email: info@satoengineering.com. These are the only contact details on the site.
- Update the Contact page, the Company at a glance panel ("Offices: Lagos · Abeokuta") and the footer.
- The head office address is no longer a blocking open item; remove it from `docs/open-items.md`.

## 3. Logo and visual prominence

- The logo is too small on desktop. Increase it so it's clearly prominent: target around 64px tall on desktop (≥1024px), 52px on tablet and 40px on mobile. Always scale by height with `width: auto` to preserve the aspect ratio; never set both dimensions. Increase the header height and padding to fit, and check the mobile menu button still aligns.
- If the logo file in `/brand/` is raster only, use the highest-resolution version available and serve it at 2x. A PNG taken from the client's deck is in the pack as `sato-logo-from-deck.png` (680×267, transparent) if nothing better exists; request an SVG from the client in `docs/open-items.md`.
- Brand greens sampled from the logo: `#2E7229` (primary brand, buttons, links) and `#177B0B` (brighter green, sparing highlight only). Replace the provisional greens from prompt 10 with these and recheck AA contrast.
- "Everything should appear bolder and more prominent": increase header nav weight to 600, raise display heading weight to the heaviest Archivo weight in use, increase H1/H2 sizes one step on desktop, and make primary buttons larger (taller, bolder label). Keep body text as is for readability.

## 4. Services structure (replaces prompt 10, section 3)

Top-level service categories, in this order:

| # | Category | Route | Contains |
|---|---|---|---|
| 1 | **Infrastructure Services** | `/services/infrastructure` | Subheadings: Construction & Civil Engineering; Electrical Engineering; Mechanical Engineering; Water Resources & Environmental Engineering |
| 2 | **Energy Services** | `/services/energy` | As drafted in prompt 10 |
| 3 | **Oil & Gas Services** | `/services/oil-gas` | New content, section 5 below |
| 4 | Technology (Digitalization & Digital Twin; Research, Technology & Innovation) | as currently built | **Leave exactly as it is.** The client may split it later. |

- Rename the group "Engineering" to **"Infrastructure Services"** everywhere (nav, services overview, home, services.json `group` values, docs).
- Create `/services/infrastructure` as a landing page: a short intro ("Our established infrastructure practice, delivering since 1997"), then the four services as subheadings, each with its summary, top capabilities and a link to its existing detail page. Keep the four detail pages and their routes.
- Nav: Services dropdown shows Infrastructure Services (with its four sub-items indented), Energy Services, Oil & Gas Services, then the Technology group as it is now.
- Home "What we do" and the Services overview follow the same order and grouping.
- Cross-link: the Oil & Gas page links to Digitalization & Digital Twin, since much of the oil and gas work is digital.

## 5. Oil & Gas Services page content

### Important: whose track record this is

The deck presents the oil and gas capability of **Sato together with its technical partner** (the client's oil and gas collaborator). The project list is explicitly titled "Past Projects with Partners", and the headline figures (projects, patents, publications, countries) describe the partner team's experience, not Sato's own delivery history. The site must make this clear. Oil company visitors will verify claims, and presenting a partner's projects as Sato's own would damage the company's credibility.

Rules for this page:
- Capabilities and solutions are written as what Sato offers ("We provide…").
- Past projects, figures, patents and awards are always attributed: "delivered by our technical partners" / "our partner team's experience". They never appear on the main Projects page or in Sato's own project counts.
- Don't name the collaborator until the client confirms we can (`partnerName` in services.json, empty for now, section hidden when empty).
- Set `"reviewStatus": "draft"` on this service. It must be approved by the client **and** his collaborator before launch (the build gate from prompt 10 already blocks drafts). Add the full page text to `docs/services-for-review.md`, with a clear note on the attribution approach.

### Page structure and copy

**H1:** Oil & Gas Services

**Summary:** Consulting, engineering and digital technology services for the upstream oil and gas sector, delivered with our technical partners.

**Overview:**
We help operators, national and international oil companies, and service companies get more value from their reservoirs and assets. Working with a partner team of internationally recognised subject-matter experts, we support the full field lifecycle: from field development planning and reservoir management to production optimization, digital twins, asset integrity and the procurement of production and surface processing equipment.

We apply innovative technologies and proven best practice to improve performance and efficiency, optimise costs, and manage risk and uncertainty.

**Our areas of capability** (three blocks, each with its list):

1. **Artificial intelligence, digitalization and digital twins, automation and autonomy**
   - Project assessment, benchmarking and technology roadmaps
   - Real-time production optimization, from definition to implementation
   - Automation of petroleum engineering standards and business workflows
   - AI-assisted reservoir and production digital twins
   - Information management standards, workflows and solutions

2. **Integrated asset management and production optimization**
   - Reservoir, well and facility production proxy modelling, multi-sensor data assimilation and uncertainty quantification
   - Well operating envelopes and well integrity
   - Production monitoring and management of reservoirs, wells and facilities
   - Production capacity forecasting, production loss management and production enhancement

3. **Field development planning and reservoir management**
   - Field development planning, review, evaluation and optimization
   - Reservoir characterization and geo-modelling
   - Reservoir simulation and production forecasting
   - Integrated reservoir management standards

**Technology solutions** (compact two-column list):
Seismic inversion · Time-lapse seismic analysis · Simulation-to-seismic analysis · Integrated reservoir characterization · Field development planning · Mature field potential analysis · Reservoir surveillance, monitoring and management · Production optimization and enhancement · Completions and wellbore interventions · Topside facilities management · Produced water management · Multiphase flow metrology · Process instrumentation, control and optimization

**Also covered** (from the deck's company profile; add as a short list): drilling services optimization; asset integrity management; mature field management; virtual asset management for integrated energy systems.

**Equipment sourcing and procurement:**
Intro: "We source and procure production and surface processing equipment from leading original equipment manufacturers."
Categories (show categories; brands in lighter text after each):
- Pumps: centrifugal and reciprocating pumps (Ruhrpumpen, Dean, D-Pump, NOV, Viking); chemical injection pumps (Wilden, Texsteam)
- Metering and flow: meters (Brodie, Smith); turbine meters (Dresser); LACT and prover units; orifice fittings and plates (Daniel); flow monitoring and control systems; NUFLO MC-III EXP flow analyzers
- Valves and actuation: valves (KTM, CWT, Warren, Versa); control valves (Fisher, Masoneilan, Maskot); actuators (Valtek, Emerson Bettis); Fisher regulators; solenoid valves (ASCO, Norgren); Swagelok valves and fittings; positioners (Siemens PS2)
- Instrumentation: pressure, flow and temperature transmitters (Rosemount, Endress+Hauser, ABB); pressure and temperature gauges and switches (Wika, Ashcroft, Bourdon Haenni, Axelson); chart recorders (Barton); Allen-Bradley instruments; Budenberg calibration equipment
- Process control and automation: ABB process control and automation (DCS, ECS and HIS systems)
- Compression and safety: instrument air compressor packages (Quincy, Ingersoll Rand); gas sensors and detection
- Mechanical components: SKF bearings

Add a `{{CONFIRM: brand names may be listed publicly; confirm whether Sato or its partner holds any authorised distributor status}}` note on this block. Don't use the words "authorised", "official" or "distributor" unless confirmed.

**Partner experience** (section heading: "Experience of our partner team"):
Intro: "Our technical partners have delivered projects for national oil companies, international oil companies, governments and service companies across the Middle East, the Americas, Africa and Australia."

Selected projects (table: client, project, year). All attributed to the partner team:

| Client | Project | Year |
|---|---|---|
| ADNOC | Integrated Reservoir Management process standardization | 2018 |
| ADNOC | Integrated Asset Model standard operating process | 2019 |
| ADNOC | Reservoir performance review process automation | 2020 |
| ADNOC | Well multiphase virtual flow metering and short-term forecast | 2019 |
| ADNOC Gas | Gas storage strategic planning and economic modelling | 2019 |
| Al Dhafra | Area 2 field development plan with uncertainty and risk modelling | 2019 |
| ADNOC | ABK field development plan with uncertainty and risk modelling | 2021 |
| ADNOC | Underbalanced drilling feasibility planning for tight gas reservoirs | 2021 |
| ADNOC | Production loss system with business process management | 2021 |
| ADNOC | Thamama Center data wall design, configuration and maintenance | 2021 |
| ADNOC | Corporate annual reservoir performance review automation system | 2022 |
| ADNOC | Country-wide integrated production capacity model | 2024 |
| ADNOC | Well flow test frequency optimization: AI-based recommender system | 2024 |
| ADNOC | Thamama Center digitization and artificial intelligence strategy | 2024 |
| Kuwait Oil Company | Kuwait Intelligent Digital Oilfield: North Sabriyah, Southeast and Burgan fields | 2015 |
| RPSEA / Chevron | Gulf of Mexico estimated ultimate recovery prediction system | 2018 |
| Pacific Rubiales | Guatiquía field development planning | 2017 |
| Ecopetrol | Rubiales field in-situ combustion facility design | 2013 |
| Santos | Coal bed methane integrated production model: training and SOPs | 2016 |
| Enrema | Unconventional fracture operations design | 2019 |
| US Bureau of Land Management | Helium gas storage | 2022 |
| Vaalco | Integrated nodal analysis of Equatorial Guinea subsea wells and FPSO | 2025 |
| E3 Lithium | Data-driven permeability prediction model with training and transfer | 2025 |
| Halliburton | Patents: enhanced oil recovery (2013), fast history matching (2015), ESP predictive analytics with University of Houston (2019) | 2013–2019 |
| Stoic | Digital oilfield "petroleum engineering in a box" software solution | Ongoing |
| Cradle | Exploration and production training | Ongoing |

Show the first 8 rows by default with a "Show all" toggle (works without JS by rendering all rows in a `<details>` element).

Wide-scope engagements (short list under the table): Integrated reservoir management (ADNOC, UAE); Area 2 FDP review (Al Dhafra, UAE); Kuwait Intelligent Digital Oilfield (KOC, Kuwait); Santos GLNG IPM standards (Australia); multiple FDPs (Pemex, Mexico); multiple IAM and FDP projects (PDVSA, Venezuela); Khurais/Shaybah field development (Aramco, Saudi Arabia); Manantiales and Maurek fields (Repsol, Argentina); digital asset for Uganda (Halliburton); in-situ combustion facilities and DOF strategy (Pacific, Colombia); Al Hosn Gas upstream IT strategy (UAE).

**Headline figures:** the deck gives inconsistent numbers (170, 250+ and 280+ projects; 6 and 8 patents; 13 and 15 countries; 25+ years and "over 200 years combined"; 150+ publications). **Don't publish any figures yet.** Build a figures strip component fed by `partnerFigures` in services.json, leave it empty (section hidden), and list the conflicting numbers in `docs/services-for-review.md` for the client and collaborator to settle.

**Case study** (collapsible or its own section, attributed to the partner team): "Well intervention strategies for production enhancement".
- Challenge: a national oil company needed to increase production from mature brownfields at profitable cost, but conventional workflows couldn't identify and rank intervention candidates across thousands of wells quickly or predict post-job performance reliably.
- Solution: an automated production enhancement system covering candidate identification and ranking, AI-driven prediction of post-job well performance, and closed-loop evaluation of job outcomes.
- Results (validated in two giant brownfields with 3,000+ active well strings and 1,400+ workovers a year): over 80% predictive accuracy in blind tests; 5–20× more feasible high-value opportunities than manual review; 250,000 barrels of oil per day of incremental production; 17% less CAPEX to achieve the production uplift.
- Don't name the client in the case study heading or body until the client confirms; `{{CONFIRM: can the case study client (ADNOC) be named?}}`

**Recognition (partner team):** 2015 SPE International P&O Award; strategic partnerships with leading universities in the USA and Canada.

**Leave out:** the deck's "100% on budget / on schedule / exceeding expectations" claims and the "+10–200% profit, 1000% ROI" figure. They're unverifiable and would undermine credibility with procurement teams. List them in `docs/services-for-review.md` as "omitted, can be added if the client insists".

Also remove "Nigeria" from the deck's country list (section 1 applies here too).

**CTA:** addressed to oil and gas operators and procurement teams: "Discuss your field, asset or procurement requirement with our team." → Contact.

## 6. Projects

- The Projects page reflects the service structure. Filters: **All · Infrastructure Services** (sub-filters: Buildings, Roads & Pavements, Water) **· Energy Services · Oil & Gas Services**. A category appears only when it has at least one Sato project. Right now only Infrastructure Services will show.
- Partner projects from section 5 never appear on the Projects page.
- Each project's `relatedService` should use the new structure so the service pages keep showing related projects.

## 7. Source content from the live website

The client says the current live site is the most detailed and up-to-date source. Before writing any copy, re-check every page of https://www.satoengineering.com against `/content` and add anything missing. Several old pages currently fail with redirect loops; for those, use the most recent Wayback Machine snapshot (`https://web.archive.org/web/2025*/satoengineering.com/<path>`). Pages to check: about-us, core-services, clients, our-team, projects and its four sub-pages, project-1 to project-4, awards and the two 2012 award news posts, equipments, news-events, safety-policies, future-plans, contact-us.

Useful content found on the live site that should be used:
- **Future Plans page:** the company expanded from Abeokuta to Lagos, Ibadan and Abuja; it owns a large fleet of plant and machinery; it aims to deliver highways, airports, railways and hydro-electric power projects, and to expand across Africa. Use the fleet and ambitions (without "Nigeria") in the About page "How we work" and a short "Where we're going" paragraph. Don't list Ibadan or Abuja as offices (section 2).
- **Welcome text:** scope covers all aspects of civil engineering design and construction for roads, dams, irrigation development, buildings and water resources development. Make sure Infrastructure Services reflects this.
- **Award news posts:** extract the awarding bodies for the two 2012 awards if the snapshots have them.

## 8. About page

- Keep the tagline/motto ("Quality engineering since 1997"), and the client's mission and vision (from prompt 10) exactly as they are.
- Remove "Our new name" (section 1).
- Intro: "Sato Engineering & Infrastructure Limited was established in 1997. For nearly three decades we have delivered civil engineering design and construction across roads, dams, irrigation, buildings and water resources, for clients ranging from government ministries to international development partners. Today our work spans infrastructure, energy, and oil and gas."
- Add "Where we're going" from section 7: expansion across Africa and beyond, with the plan to register internationally. Keep it to two sentences and don't name countries.

## 9. Clients

Keep the Clients page and the Home "Trusted by" strip as built. No changes other than removing "Nigeria" wherever it appears.

## 10. Leadership

- Leadership remains **Engr. Wale Osamiluyi** only. Display name: "Engr. Wale Osamiluyi, FNSE, FNIEE, FNIWE". Title: Founder & Managing Director.
- He will send updated details; keep the current bio (with section 1's abbreviation change) until then.
- No contact details on the leadership page (section 12).

## 11. HSE: on hold

HSE is on hold until the client reviews it with his oil and gas collaborator.
- Unpublish `/hse`: remove it from nav, footer, sitemap, service-page strips and all internal links, and exclude it from the build. Keep the content file.
- Redirect `/hse` and the old `/safety-policies/` to `/about` for now.
- Store the old site's safety policy text in `content/pages/hse.json` for later (rewritten, without "Nigeria"): Sato is committed to managing safety, quality and environmental matters professionally; its people are its most valuable asset and it works to prevent work-related injuries; it operates its own safety management system (corporate safety standards, safety management plans, implementation guidelines), implemented on every project and audited internally every three months; all employees attend general and project-specific safety inductions monthly; PPE is provided as required, with a minimum of safety helmet and safety boots.
- Remove HSE from `docs/open-items.md` blockers; list it under "on hold".

## 12. Personal contact details

The deck contained the founder's personal email and a personal international phone number. Neither is in this prompt, and neither may appear on the site. The only contact details allowed anywhere are **info@satoengineering.com** and **+234 803 330 3278**. Add to the build check: fail if the exported HTML contains any email address other than info@satoengineering.com, or any phone number other than +234 803 330 3278.

## 13. After implementing

1. Run `npm run build`, then `npm run build:prod` to confirm the gates catch what they should: the Oil & Gas draft, the Energy and other drafts from prompt 10, and any remaining `{{CONFIRM}}`.
2. Build a review deployment (Vercel preview URL) that shows drafts, so the client and his collaborator can review everything in context. Placeholders and draft sections must be visibly marked on the preview.
3. Regenerate `docs/open-items.md` in three groups: **Client to confirm** (Abeokuta street address, extra offices, updated founder bio and headshot, SVG logo, awarding bodies if not found); **Client and collaborator to confirm** (Oil & Gas page approval, partner name, partner figures, case-study naming, brand list/distributor status, HSE content); **On hold** (HSE page, Technology split).
4. Report back with the plan you followed, screenshots of Home, Services, Infrastructure Services and Oil & Gas at desktop and mobile (showing the larger logo), the banned-terms check output, and `docs/open-items.md`.

## Done when

- No "Nigeria", "Nigerian", "formerly" or "317208" anywhere in the exported site, enforced by the build check
- Offices read "Lagos Office" then "Abeokuta Office"; no "Head Office"
- Logo visibly larger on desktop, aspect ratio intact, bolder header and headings
- Services: Infrastructure Services (with four subheadings), Energy Services, Oil & Gas Services, Technology unchanged
- Oil & Gas page complete, partner work clearly attributed, draft-gated
- HSE unpublished and redirected; Projects filter follows the service structure
- Only info@satoengineering.com and +234 803 330 3278 appear as contact details
