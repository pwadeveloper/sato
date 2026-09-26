# Prompt 10 — Apply the client's answers (form v1)

> Recorded verbatim from the brief of 25 September 2026. Where this file
> conflicts with CLAUDE.md, docs/site-content.md, or prompts 01–09, this file
> wins. See the "Applied" note at the foot for deviations and why.

The client has returned the website information form. This prompt records every decision from it. **Where this file conflicts with CLAUDE.md, docs/site-content.md, or prompts 01–09, this file wins.** Apply it to whatever has already been built, and update CLAUDE.md and docs/site-content.md so any prompt not yet run picks up the changes.

---

## 1. Company details

| Field | Value | Status |
|---|---|---|
| Registered name | **Sato Engineering & Infrastructure Limited** (ampersand, not "and") | Confirmed |
| Name change effective | 3 August 2026 | Confirmed |
| Former name | Sato Engineering Nigeria Limited | Confirmed |
| RC number | 317208 | Confirmed |
| Incorporated | 1997 | Confirmed |
| Phone | +234 803 330 3278 | Confirmed ("correct for now") |
| Email (display) | info@satoengineering.com | Confirmed |
| Contact form recipient | info@satoengineering.com | Confirmed |
| Domain | Keep satoengineering.com | Confirmed |
| Social media | None — remove any social links/icons | Confirmed |
| Tagline | Quality engineering since 1997 | Confirmed |
| Head office street address | Not provided | **Blocking** — keep `{{CONFIRM}}` |
| Lagos branch / other offices | Not provided | Optional — remove from content; show head office only |

## 2. Brand colour: green

Replace the laterite accent with green across the design system. Provisional
values until the logo arrives: `brand` `#1E5B3C`, `brand-dark` `#143F29`,
`brand-tint` `#E3EDE6`. Rename the token from `laterite` to `brand`. Keep
asphalt, concrete, steel and white. Keep survey yellow for focus states only.
If `/brand/` contains logo files, sample the exact green(s) from the logo and
use them instead of the provisional values.

## 3. Services: new structure (eight services)

| # | Display name | Route | Group |
|---|---|---|---|
| 1 | Construction & Civil Engineering | `/services/construction-civil-engineering` | Engineering |
| 2 | Electrical Engineering | `/services/electrical-engineering` | Engineering |
| 3 | Mechanical Engineering | `/services/mechanical-engineering` | Engineering |
| 4 | Water Resources & Environmental Engineering | `/services/water-resources-environmental` | Engineering |
| 5 | Energy Services | `/services/energy` | Energy |
| 6 | Oil & Gas Services | `/services/oil-gas` | Energy |
| 7 | Digitalization & Digital Twin Services | `/services/digital-twin` | Technology |
| 8 | Research, Technology & Innovation | `/services/research-innovation` | Technology |

Add `group` and `order` to services.json. Services overview shows three bands.
Home "What we do" shows the three groups with service names as links. Nav keeps
one "Services" item with a grouped, keyboard-accessible menu. Remove the three
old routes and 301 them to 1, 4 and 2 respectively. Old Civil & Infrastructure
copy carries to service 1; old Water Resources copy to service 4.

Services 2, 3, 5, 6, 7, 8 are drafted from the partner reference sites
(Frontender, SunRise PetroSolutions, OGAB Engineering — the partner has said
this content is free to use). No factual claim about the partner transfers:
no projects, clients, certifications, staff numbers, years, locations,
statistics or awards. Capability descriptions only. Each is
`"reviewStatus": "draft"` and the placeholder gate fails a production build
while any draft remains.

## 4. Projects

Keep all 16 projects from the old site. Remove every `{{CONFIRM: status}}` and
`{{CONFIRM: year}}`. Show "Completed" only where the old site says completed or
handed over; "contract awarded" projects show "Awarded 2012" with no badge.
Make `year`, `location` and `client` optional and hidden when empty.

Added: Reefer Pavement Works (APM Terminals Apapa); Bulk Meters — Immersion and
Ultrasonic (USAID E-WASH); Prepayment and Electromagnetic Bulk Meters (World
Bank / Federal Ministry of Water Resources); Sagamu Intake Structure (World
Bank / Ogun State Water Corporation). Ogere is the existing project — set its
client to "World Bank / Ogun State Water Corporation", do not duplicate.

Rename the sector "Roads" to "Roads & Pavements". Home featured: Sagamu Intake,
Reefer Pavement Works, Ogere, Fiditi.

## 5. Clients

Keep every existing client. Add APM Terminals Apapa Limited (private) and
USAID — E-WASH Programme (international). Use "Joseph Ayo Babalola University".
Text only, no logos. Add World Bank, USAID and APM Terminals to the Home strip.

## 6. Optional content: hide when empty, never block

`{{CONFIRM}}` is only for content the site cannot launch without. Anything
optional is stored empty (`""` / `[]`) and its section hidden. Converted:
oil & gas registrations, ISO certifications, safety record, awards since 2012,
branch offices, social media.

## 7. Leadership: founder only

Show Engr. Wale Osamiluyi — Founder & Managing Director only. Below him, "How we
build project teams". Delete: Adeoniye Adekunte, Bidemi Adeleke, Olushola
Oladejo, Faronbi Gbemi, Tella Sunday, Olalekan Ajayi, Alausa Azeez, Stephen
Aloko, Femi John. Keep unpublished: Olubunmi Ajileye, Lekan Omololu, Olatunde
Opeyemi, Samuel Kolawole, Taiwo Adekola. Remove the named HSE lead from the HSE
page.

## 8. Awards

Extract the awarding body for each 2012 award from the old site. If none can be
found, show the award without the body. No placeholders either way.

## 9. HSE

Fetch `/safety-policies/` from the old site and rewrite it. Certifications and
safety record optional and hidden. If the page cannot be fetched, write a short
conservative commitment and mark it `{{CONFIRM: HSE policy content}}` (blocking).

## 10. Equipment: remove the page

Delete the `/equipment` route and nav/footer links; keep `equipment.json` in the
repo. Redirect `/equipment` and `/equipments/` to `/about`. Add one sentence to
About "How we work" about Sato's own plant including a borehole drilling rig.
Point the "Backed by Sato" strip at HSE and Projects instead of Equipment.

## 11. Mission and vision (verbatim)

- **Mission:** To deliver innovative, sustainable and value-driven engineering and infrastructure solutions that meet the highest standards, exceed client expectations and create lasting value.
- **Vision:** To be a globally recognized engineering and infrastructure company, renowned for excellence, innovation and world-class project delivery.

The CLAUDE.md tone rule against superlatives does not apply to these two.

## 12. Updated sitemap

`/`, `/about`, `/services`, `/services/[slug]` (eight), `/projects`,
`/projects/[slug]`, `/clients`, `/leadership`, `/hse`, `/contact`.

## 13. What still blocks launch

1. Head office street address
2. Logo files (header, footer, favicon, OG image)
3. Approval of the six drafted services by Engr. Wale Osamiluyi
4. HSE policy content, only if the old page could not be fetched
5. Non-blocking: updated founder bio, headshot, newer project photos, project
   years, oil & gas registrations, hosting/domain access for cutover

---

## Applied — deviations and why

Recorded 25 September 2026 when this brief was carried out.

1. **Green sampled from the logo, not the provisional values.** `/brand/`
   contained `Black.png` and `White.png`, byte-identical to the logo already in
   `public/images/`. Section 2 says to sample from the logo where it is
   present, so the brand green is the logo's **#177B0B**, with `brand-deep` and
   `brand-tint` derived from it. The provisional `#1E5B3C` / `#143F29` /
   `#E3EDE6` were not used — they are a far darker forest green and would read
   as a different brand from the mark.
2. **No SVG logo was supplied.** `/brand/` holds the same PNGs already in use,
   so "replace the text logo with the SVG logo" was a no-op. SVG files remain on
   the open-items list.
3. **Popoola Oyenola** (Executive Director, Projects & Development) appears in
   neither the delete list nor the keep-unpublished list in section 7 — 15 of
   the 16 people in `team.json` are accounted for. He was set to
   `published: false` with the "no answer" group rather than deleted, pending a
   decision.
4. **Survey yellow kept on the data plate.** Section 2 says to drop it where it
   clashes with the green; on the asphalt plate it does not clash, and it is the
   design plan's one hi-vis moment, so it stayed.
5. **Services 2 and 3 are conservative drafts.** None of the three reference
   sites covers electrical or mechanical engineering as a building-services
   discipline — all three are oil and gas, subsurface and digital consultancies.
   Those two services were written from Sato's own record instead, with no
   claims of past delivery beyond what the projects support.
