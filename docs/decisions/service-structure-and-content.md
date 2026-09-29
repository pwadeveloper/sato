# Prompt 15 — Service structure, richer content, Oil & Gas copy, heading consistency

Client feedback from the latest review call. Implement it in one pass. **Where this file conflicts with earlier prompts or docs, this file wins.** Update CLAUDE.md and docs/site-content.md to match, and save this file as `docs/decisions/service-structure-and-content.md`.

No change to the dropdown arrows in the Services menu; the client has decided to keep them as they are.

Start with a short plan, then proceed. Commit nothing; I'll review first.

---

## 1. Oil & Gas copy changes (client-approved, implement exactly)

**Capabilities, first paragraph.** Replace the opening sentence of the Oil & Gas overview with the client's wording:

> We help operators (independent, national and international oil companies) to maximize value from their existing assets (reservoirs, wells and facilities).

Keep the rest of the paragraph that follows it ("Working with a partner team…" onwards) unchanged. (The client wrote "Independent" with a capital I; use lowercase for consistency with the rest of the sentence.)

**Partnerships.** Find the sentence beginning "Our technical partners have delivered projects for…" (wherever it now lives after batch 4) and replace it with:

> Sato and its technical partners have delivered projects for independent, national and international oil companies across the Middle East, South America, North America, Africa, Europe and Australia.

It belongs in the **Partnerships** section of the Oil & Gas service page. If it currently sits on `/projects/oil-gas`, move it to Partnerships and leave `/projects/oil-gas` with its existing attribution line.

**Don't change** `labels.partnerAttribution` ("Delivered by our technical partner team.") or the Clients page in this batch. The new wording implies Sato took part in the partner projects, which is a change from how they've been attributed so far. I'm confirming that with the client; add it to the top of `docs/open-items.md`:
- "New partnership line says 'Sato and its technical partners have delivered…'. Confirm Sato was involved in these projects. If yes, update the project attribution line to match. If no, revert to 'Our technical partners…'."
- "The client defined clients as 'companies Sato delivers solutions to and gets paid by'. The oil and gas list on /clients ('clients served through our technical partners') may not fit that definition. Confirm whether it stays."

## 2. One structure for every service: Capabilities · Solutions · Partnerships

Every service line should follow the same three-part format the Oil & Gas page already uses:

1. **Capabilities**: what we can do (the disciplines and expertise)
2. **Solutions**: what we deliver for clients (the outcomes, systems and services)
3. **Partnerships**: who we work with to deliver it

Build this as one shared service-page template:
- Three sections with IDs `#capabilities`, `#solutions`, `#partnerships`, and the sticky in-page sub-nav used on Oil & Gas.
- A "Projects" link in the sub-nav appears only when the service has a visible Projects category (as on Oil & Gas today, pointing to the Projects page, not an anchor).
- A section with no content is hidden, and so is its sub-nav item. A service page must never show an empty heading.
- Move Oil & Gas onto the shared template. Its content and order stay the same; this is a refactor, not a redesign.
- Restructure `services.json` so each service has `capabilities`, `solutions` and `partnerships` blocks (each: optional intro, items, optional subgroups, optional media).

Apply the template to all service pages now: Infrastructure Services (landing and its four sub-services), Energy Services, Oil & Gas Services, Digitalization & Digital Twin Services, and Research, Technology & Innovation Services. Map existing content into the three sections; new content comes from sections 3 and 4.

## 3. Infrastructure Services: richer content

The client says Infrastructure Services is too thin next to Oil & Gas. Enrich it, framed around **infrastructure types** (civil, electrical, mechanical, water resources) without spelling out every subcategory. Each type is multidisciplinary, so the Capabilities / Solutions framing should cover them rather than long lists.

**Reference sites for framing and structure (inspiration only):**
- https://digitalwaterlab.org
- https://hyfi.io

Read both and note how they present capabilities and solutions: the kinds of problems addressed, how solutions are grouped, how technology and data are woven into infrastructure work. Then write **original** copy for Sato.

Rules:
- These are third-party websites, not partner content. **Do not copy their wording**, product names, features, data or claims. Use them for structure and framing only.
- Don't claim technology, products, monitoring systems or digital capability that Sato's existing content, projects or services don't support. Where the reference sites suggest a direction Sato could offer (e.g. monitoring or data-driven asset management for water infrastructure), phrase it as a service Sato provides, and flag it in the review doc so the client can confirm he offers it.
- Tie the content to Sato's real record: nearly three decades of roads, dams, irrigation, water supply schemes, buildings and bulk metering for government, universities and development partners.

**Infrastructure Services landing page (`/services/infrastructure`):**
- **Capabilities:** a short intro, then the four infrastructure types, each with two to three sentences on the disciplines involved. Link each to its sub-service page. No exhaustive lists.
- **Solutions:** four to six solution areas that cut across the types (for example: planning and design; construction and rehabilitation; water supply and resource management; power and electro-mechanical systems; asset monitoring and maintenance). Each with a short description.
- **Partnerships:** see section 5.

**Each of the four sub-service pages:** Capabilities (keep the existing capability items, add a short framing paragraph) and Solutions (three to five solutions specific to that type). Keep them noticeably shorter than the landing page.

Mark all new Infrastructure copy `"reviewStatus": "draft"` and add it to `docs/services-for-review.md` under "Infrastructure Services — enriched content", noting which ideas came from which reference site. (This adds to the approval list already blocking launch; that's expected.)

The client is also sending a US-based infrastructure reference site. Add "US infrastructure reference site: awaiting link" to `docs/open-items.md`.

## 4. Digitalization & Digital Twin, and Research, Technology & Innovation

The client says both are still thin. His partner has sent a reference site to use as placeholder inspiration for both:
- https://www.norcompute.no

Read it (including its services, solutions and research pages if it has them) and rewrite both service pages into the Capabilities / Solutions / Partnerships template:
- Same rules as section 3: **original wording only**, no copied text, product names or claims about that company.
- Connect to what Sato already has: the Oil & Gas page's digital twin, AI and real-time optimization content; the pyramid diagram (link to it rather than repeating it); and the bulk metering projects.
- Keep both `"reviewStatus": "draft"`, and note in `docs/services-for-review.md` that this is placeholder content pending the client's own material (he's still sending digital twin content).

## 5. Partnerships sections: don't invent partners

The client draws a clear line:
- **Partners** are technical partners who co-deliver work with Sato.
- **Clients** are the companies Sato delivers solutions to and is paid by.

So a Partnerships section must only describe genuine technical partners. Don't list clients, funders or development institutions (World Bank, USAID, etc.) as partners.

- **Oil & Gas:** keep the existing partner team content with the new line from section 1.
- **Digitalization & Digital Twin, and Research:** the same oil and gas partner team contributes here; a short Partnerships section can say Sato delivers these services with its technical partners (no names, no figures).
- **Infrastructure Services and Energy Services:** no partnership information exists yet. Leave the Partnerships content empty, so the section and its sub-nav item stay hidden. Add to `docs/open-items.md`: "Partnerships for Infrastructure and Energy: who are Sato's technical partners here, if any?"

## 6. Consistent heading format across all service pages

Section headings are inconsistent: for example the pyramid's "Surveillance to Transformation" heading, "Technology solutions" and the equipment sourcing heading don't share a style.

- Define one heading scale for service pages and use it everywhere:
  - **H1:** page title
  - **H2:** the three template sections (Capabilities, Solutions, Partnerships), plus Projects where present
  - **H3:** every subsection inside them (e.g. the three Oil & Gas capability areas, "From surveillance to transformation", "Technology solutions", "Equipment sourcing and procurement")
  - **H4:** only for groups inside an H3 (e.g. equipment categories)
- Same component, size, weight, colour and spacing for each level on every service page. **Sentence case throughout** (e.g. "Technology solutions", "From surveillance to transformation"). Proper nouns and acronyms keep their capitals.
- Remove one-off heading styles; route every heading through the shared Heading component.
- Write the before/after list of every service-page heading into `docs/heading-audit.md`.

## Done when

- The Oil & Gas opening sentence and Partnerships line match section 1 exactly; the attribution label and Clients page are unchanged, and both questions are at the top of `docs/open-items.md`
- Every service page uses the shared Capabilities · Solutions · Partnerships template, with empty sections and their sub-nav items hidden
- Infrastructure Services (landing and four sub-pages) has richer original content framed by infrastructure type, marked as draft
- Digitalization & Digital Twin and Research, Technology & Innovation have placeholder content drawn from norcompute.no, marked as draft
- No Partnerships section lists a client or funder
- Service-page headings follow one scale in sentence case; `docs/heading-audit.md` exists
- No text copied from digitalwaterlab.org, hyfi.io or norcompute.no (spot-check: search the new copy for distinctive phrases from each site and report the result)
- `npm run build` passes, and the banned-terms and contact checks still pass

Report back with screenshots of Infrastructure Services (landing and one sub-page), Oil & Gas, and Digitalization & Digital Twin (desktop and mobile), the heading audit, and the updated `docs/services-for-review.md` and `docs/open-items.md`.

---

## How it was implemented

Notes added by the build, after the instruction above. Where they record a
judgement call, the call is flagged.

### The three sections are content, the sub-nav is derived

`services.json` gained a `sections` object per service — `capabilities`,
`solutions`, `partnerships` — each with an optional `intro`, `items`,
`groups`, `aside` and `media`. `media` is a tagged union (`list`, `pyramid`,
`valueMap`, `procurement`), so the order of the blocks inside Solutions is
the order they are written in and a service that wants two diagrams needs no
new field.

**Nothing declares its own sub-nav.** `getServiceSections()` in
`lib/content.ts` builds it from what the sections actually hold, and
`hasSectionContent()` is the single test for "empty". A section with nothing
in it produces no band, no `h2`, no `#id` anchor and no nav item. The section
labels come from `pages/services.json`, so "Capabilities" is one string for
the whole site.

The hand-written `sectionNav` array is gone from `services.json`. **The Oil &
Gas sub-nav the client asked us to leave alone is byte-identical** out of the
derivation: Capabilities · Solutions · Projects (to `/projects/oil-gas`) ·
Partnerships, with Projects still a destination rather than an anchor.

### The in-body "See our … projects" link came off

With Projects now in the sub-nav of every service that has a published
category, the link at the foot of the page was the same destination twice on
the same screen. `labels.projectsLink` is removed. This also keeps Oil & Gas
exactly as the client left it — he removed the Projects stub block on the
grounds that a heading over one link is not a section, and adding a link back
into the body would have walked into that.

### The menus were deliberately not changed

Every service page now has the same three sections, so listing them under
every category in the Services dropdown and on the services overview would
print the same two or three generic words under all five categories. A
service opts in with `showSectionsInMenu`, and Oil & Gas is the only one that
does — which is exactly today's behaviour. The dropdown arrows are untouched.

### One addition to the Oil & Gas page

The "Backed by Sato" strip is now on every service page, including Oil & Gas,
which did not have it. It sits outside the three sections, below Partnerships
and above the CTA, like the CTA band does. The three sections and their order
are unchanged. **Flagged because the instruction was "a refactor, not a
redesign"** — if the client would rather that page still ended on
Partnerships, it is one conditional.

### Two services moved from approved to draft

Civil Engineering & Construction and Water Resources Development & Management
were approved on carried-over copy. Both gained a framing paragraph and a
whole Solutions section, so both are now `draft`. That takes the approval
list from six services to eight, plus the Infrastructure landing page.

### The landing page is inside the review gate now

`/services/infrastructure` writes its own capability copy — the four types
and six solution areas are on the page, not on any service — so `Page` gained
an optional `reviewStatus` and `scripts/check-placeholders.mjs` now reads
pages as well as services. Without it, that copy would have been the one body
of capability text on the site outside the gate.

### Copied-text check

No 4-word sequence of the new copy appears on any of the three reference
sites, and none of 57 distinctive phrases and product names from those sites
appears in the new copy. Method and result are in
`docs/services-for-review.md`.
