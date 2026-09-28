# Prompt 13 — Client feedback batch 4 (projects, solutions, bio)

The client is happy with progress. This batch has three changes. **Where this file conflicts with earlier prompts or docs, this file wins.** Update CLAUDE.md and docs/site-content.md to match, and save this file as `docs/decisions/client-feedback-batch-4.md`.

Start with a short plan, then proceed.

---

## 1. Projects: everything under the Projects umbrella

The client wants **all projects to live under Projects**, grouped by subheading, and not inside the Services section. That includes the oil and gas projects.

### Remove projects from Services
- Remove every "Related projects" section from all service pages (including Civil Engineering & Construction and its sub-services) and from the Services overview.
- Replace each with one small link at the bottom of the service page: "See our [category] projects" → the matching Projects category page. (Energy, Digital Twin and Research have no project category yet; show no link.)

### Projects categories (four, in this order)

| Category | Route | Content |
|---|---|---|
| Buildings & Construction | `/projects/buildings-construction` | Sato's projects (unchanged) |
| Civil Engineering & Roads | `/projects/civil-engineering-roads` | Sato's projects (unchanged) |
| Water Resources Development & Management | `/projects/water-resources-development-management` | Sato's projects (unchanged) |
| **Oil & Gas** | `/projects/oil-gas` | **New:** the partner team's projects, moved from the Oil & Gas service page |

- Add the Oil & Gas tile to the `/projects` landing page and to the Projects nav dropdown.
- **Attribution still applies.** These are the partner team's projects, not Sato's own delivery record. The Oil & Gas category page must open with: "Oil and gas projects delivered by our technical partners, with whom Sato provides oil and gas services." The tile carries the subtitle "Delivered with our technical partners". The rest of the site never counts these as Sato projects (e.g. no combined project totals).
- Move to `/projects/oil-gas`: the selected projects table, the wider engagements list and the case study. Keep the "Show all" behaviour from prompt 11. These projects don't get individual detail pages; the table and list are enough.
- On the Oil & Gas **service** page, the "Projects" section and sub-nav item now link to `/projects/oil-gas` instead of an on-page anchor. Keep the other three sections (Capabilities, Solutions, Partnerships) as they are. In the Services dropdown, "Projects" under Oil & Gas also points to `/projects/oil-gas`.
- `/projects/oil-gas` sits behind the same review gate as the Oil & Gas service page (partner confirmation still pending).
- Add a redirect from the old anchor route if anything linked to it (`/services/oil-gas#projects` → handled by a small client-side redirect or by keeping the anchor with a link).

## 2. Oil & Gas Solutions: add the Sunrise services

The client wants **everything listed under "Services" on the Sunrise Engineering website** added to the existing Solutions section of the Oil & Gas page. The partner has said their content is free to use.

- Use the Sunrise Engineering URL recorded in `docs/decisions/client-answers-v1.md`. If it's missing or still a placeholder, stop and ask me for it before doing this section.
- Fetch the site's Services page (and each service's own page if the listing links to them). Collect every service listed.
- Add them to the Solutions section:
  - Merge with the existing technology solutions list; don't duplicate items that already exist under a slightly different name (e.g. "Production optimization" vs "Production Optimization & Enhancement"). Keep the clearer wording.
  - If Sunrise groups its services into categories, keep those groupings as subheadings within Solutions, below the pyramid diagram.
  - Carry over service names and short descriptions (one to two sentences each, lightly edited for consistency with the rest of the page). Don't carry over any claims about Sunrise's own projects, clients, staff, years, certifications or locations.
  - Remove the word "Nigeria" if it appears anywhere in the carried-over text.
- Record each added item and its source URL in `docs/services-for-review.md` under "Oil & Gas — Solutions (added from Sunrise)".
- The Solutions section is getting long. Keep it scannable: subheadings, a two-column layout on desktop for short items, and descriptions in lighter text.

## 3. Updated founder bio (client's own version, verbatim)

The client revised his bio and deliberately **kept the country names** for every institution, including Nigeria, for clarity and consistency (so readers know where each university is). This is his decision for his personal profile, and it replaces the abbreviated version from prompt 12.

**Name:** Engr. Wale Osamiluyi, FNSE, FNIEEE, FNIWE, FRICS
**Title:** Founder & Managing Director

(Postnominal order now matches the bio: engineering fellowships first, RICS last.)

**Bio (verbatim):**

> Engr. Wale Osamiluyi founded Sato Engineering in 1997 and has led its growth and evolution into Sato Engineering & Infrastructure Limited. An engineer with over 32 years of professional and executive experience, he provides strategic leadership and direction across the Company's multidisciplinary engineering, infrastructure and strategic business activities.
>
> He holds a Bachelor of Engineering degree in Electrical Engineering from the University of Ilorin, Nigeria; an MSc in Project Management from the University of Cape Town, South Africa; an MBA in Global Business from the Rotman School of Management, University of Toronto, Canada; and a Global Executive MBA from the University of St. Gallen, Switzerland.
>
> Engr. Osamiluyi is a registered Engineer with the Council for the Regulation of Engineering in Nigeria (COREN), a Fellow of the Nigerian Society of Engineers (FNSE), the Nigerian Institute of Electrical and Electronic Engineers (FNIEEE), the Nigerian Institution of Water Engineers (FNIWE) and the Royal Institution of Chartered Surveyors (FRICS). He is also a member of the Society of Petroleum Engineers (SPE), Nigerian Institute of Management, a Life Member of the Chartered Institute of Directors, and a Fellow of the Institute for Government Research and Leadership Technology.
>
> His achievements and leadership have been recognized through several honours, including the Rotman Executive MBA Fellowship Award for Excellence in an Emerging Market and the Power of Inclusion Leadership Award from the Council of Nigerian Professionals, Canada. Under his leadership, Sato Engineering has also received notable corporate honours, including the Nigerian Society of Engineers' Distinguished Corporate Award for Best Engineering Company in Ogun State, among others.
>
> Beyond his corporate responsibilities, he is actively involved in professional and humanitarian service, including Rotary International, with particular interest in sustainable water, sanitation and infrastructure development.

### Scoped exception to the banned-terms check

The "no Nigeria" rule still applies to **everything else on the site**. Only the founder's bio is exempt.

- Wrap the bio in an element with `data-allow-country="true"` (on `/leadership` only).
- Update the banned-terms check so it ignores "Nigeria" / "Nigerian" **only inside that element on the leadership page**. Everywhere else (including the leadership page's title, meta description, Open Graph tags and JSON-LD) the check still fails on them.
- Don't let the exception leak: the bio must not appear in any meta description, structured data, search snippet text or OG image. Write a meta description for `/leadership` without country names: "Engr. Wale Osamiluyi, Founder & Managing Director of Sato Engineering & Infrastructure Limited."
- Prove it works the same way as before: inject "Nigeria" into the About page and into the leadership meta description, confirm the check fails on both, confirm it passes with only the bio containing it, then restore.
- Document the exception in CLAUDE.md under the banned-terms rule, so a future edit doesn't "fix" the bio.

Add to `docs/open-items.md` (for Mudia, optional): the bio's third paragraph reads "a member of the Society of Petroleum Engineers (SPE), Nigerian Institute of Management, a Life Member…". Suggest to the client: "a member of the Society of Petroleum Engineers (SPE) and the Nigerian Institute of Management, a Life Member…". Don't change it on the site unless he approves.

## 4. Pending from the client (no action now)

Add to `docs/open-items.md` under "Client to send":
- Digital twin content and related information (will update the Digitalization & Digital Twin Services page)
- One consolidated document with additional slide content, to be sent after the client's next meeting with his partner

## Done when

- No service page lists projects; each links to its Projects category instead
- `/projects` shows four category tiles including Oil & Gas; the Projects dropdown lists all four
- `/projects/oil-gas` shows the partner projects and case study with the attribution line, behind the review gate
- The Oil & Gas service page's Projects item links to `/projects/oil-gas`
- Solutions includes every Sunrise service, de-duplicated and grouped, with sources recorded in `docs/services-for-review.md`
- The leadership page shows the client's bio verbatim with the new postnominal order
- The banned-terms check passes with the bio, and still fails on "Nigeria" anywhere else, including the leadership page's metadata
- `npm run build` passes

Report back with screenshots of the Projects landing page, `/projects/oil-gas`, the Oil & Gas Solutions section and the Leadership page (desktop and mobile), the banned-terms test results, and the updated `docs/open-items.md`.
