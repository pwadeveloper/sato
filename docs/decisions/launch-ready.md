# Prompt 18 — Final structure, old-site images, hide Leadership, launch-ready

Client call, final round before launch. **Target: launch-ready tonight.** Implement everything below in one pass. Where this file conflicts with earlier prompts or docs, this file wins. Save it as `docs/decisions/launch-ready.md`.

Work on the `content/mirror-old-site` branch if it exists (it holds the prompt 17 work); otherwise create it from `main`. Commit in logical steps on that branch and push it so Vercel builds a preview. Don't merge to `main` and don't touch the production domain; I'll do that after a final check.

---

## 0. Review status

> - **A. The client has approved all draft service pages.** Set every service to `"reviewStatus": "approved"`.

**The two Oil & Gas placeholders:** resolve them with the safe defaults, so they no longer need an answer:
- Equipment manufacturers: keep the categories and brand names, with no "authorised", "official" or "distributor" wording. Remove the `{{CONFIRM}}` marker.
- Case study: keep the client as "a national oil company". Don't name ADNOC. Remove the `{{CONFIRM}}` marker.

Apart from that, **leave Oil & Gas untouched**.

---

## 1. Four categories: Services and Projects mirror each other exactly

The client has agreed the final categories, following the old site's structure (Building and Construction; Water Supply and Resources; Civil Engineering and Road), with "Ongoing Projects" replaced by Electrical and Mechanical:

| # | Name | Services route | Projects route |
|---|---|---|---|
| 1 | Building and Construction | `/services/building-construction` | `/projects/building-construction` |
| 2 | Water Resources Development and Management | `/services/water-resources-development-management` | `/projects/water-resources-development-management` |
| 3 | Civil Engineering and Road | `/services/civil-engineering-road` | `/projects/civil-engineering-road` |
| 4 | Electrical and Mechanical | `/services/electrical-mechanical` | `/projects/electrical-mechanical` |

- Use the names exactly as written, with "and" (not "&") in these four.
- These four replace the current Infrastructure sub-services (Civil Engineering & Construction, Electrical Engineering, Mechanical Engineering, Water Resources Development & Management) and the current project categories for that work. The "Infrastructure Services" heading stays as the group above them.
- **Services and Projects must mirror each other exactly:** same four names, same order, same grouping, in the nav dropdowns, on the Services page, on the Projects landing page and in the footer. A category shows on Projects only if it has projects, as before; if Electrical and Mechanical has projects (e.g. the bulk meter supply projects, pump installation), it shows.
- Split the current Civil Engineering & Construction projects using the old site's own grouping: its "Building and Construction" page → category 1; its "Civil Engineering Road Projects" page → category 3. Water projects → category 2. Electrical, mechanical and pump work → category 4 (a project can also stay in Water if the old site lists it there).
- Content for the four service pages: merge the existing content into the new structure (Building and Construction takes the buildings content; Civil Engineering and Road takes the civil and roads content; Electrical and Mechanical merges the two former pages, keeping the Capabilities/Solutions template from prompt 15). No new copy beyond joining sentences.
- **Oil & Gas** stays exactly as it is, in both Services and Projects. Energy Services, Digitalization & Digital Twin and Research, Technology & Innovation keep their current place on Services, subject to section 0.
- 301 redirects from every retired route (the old service sub-pages, `/projects/civil-engineering-construction`, `/projects/electrical-engineering`, and anything from earlier redirects that pointed at them) to the matching new route. Check there are no redirect chains.

## 2. Old-site images with their original descriptions

Every project image from the old site goes onto the new site **with its original description underneath**. The descriptions are specific and the client cares about them (e.g. "Installing pump at Shagamu", "World Bank team inspecting Shagamu intake").

- If the prompt 17 work exists (`docs/old-site-inventory.json`, `docs/content-audit.md`), use it and finish anything still outstanding. If not, do the capture and mapping from prompt 17 sections 1–3 now.
- Apply the same caption clean-up as prompt 17 (sentence case, clear typos, no "Nigeria" or former name), **plus section 4 below (no dates)**. Otherwise keep the wording.
- One photo, one place. No photo on two projects or two categories.

## 3. New images from the client's email

The client resent his 16 October email (11 attachments), which includes new images. I've saved the attachments to `raw-assets/client-photos/_inbox/email-2026-11-08/` with their original filenames. Any descriptions from the email body are in `captions.txt` in the same folder.

- Compare each file with everything already processed (perceptual hash). Files already used: skip. New files: process them.
- Use the filename and `captions.txt` as the description, cleaned up the same way. Place each photo on the project its description names (e.g. Shagamu pump installation and the World Bank inspection → the Sagamu intake project; also Electrical and Mechanical if it shows pump installation). If a photo has no description and no clear project, leave it out and list it.
- Photos of identifiable people are fine here when the description shows a professional context (e.g. the World Bank inspection). Still exclude anything showing unsafe practice (no helmets on an active site) and any burned-in date stamp you can't crop out.
- Strip all metadata (GPS, camera, dates) from every published image, and verify it by script.

## 4. Remove all dates

The client wants **no dates** on images or project entries.
- Set `showProjectDates: false` and confirm nothing date-related renders on project cards, project pages or category pages: no years, no "Awarded 2012", "completed 2011" or similar.
- Remove dates from every caption, project title, narrative and alt text (e.g. "awarded in 2016", "2012", "November 2011"). Rephrase only as much as needed for the sentence to read correctly.
- Exclude or crop photos with a date stamp burned into the image.
- Keep "since 1997" and "nearly three decades" in company copy; those describe the company, not projects.
- Add `/\b(19|20)\d{2}\b/` on project pages and project captions to the build checks (allowing "1997" only where it's in the company tagline), and show me the result.

## 5. Hide the Leadership page

Not finalised, so hide it but don't delete it.
- Remove it from the nav, footer, sitemap, internal links and JSON-LD, and exclude its route from the build (same approach as HSE). Redirect `/leadership` and the old `/our-team/` to `/about`.
- Keep all its content and components, plus a `showLeadership: false` switch in site.json, so it can return with one change.
- The founder-bio exemption in the banned-terms check can stay; it simply won't match anything while the page is hidden.

## 6. Launch readiness

1. `npm run build:prod` must pass. Report anything that still blocks it.
2. Run the banned-terms, contact-details, placeholder and new date checks; show the output.
3. Check every old WordPress URL in the redirect map, plus the new retired routes, resolves to a live page in one hop.
4. Contact form: confirm whether `contactFormEndpoint` is set. If it isn't, say so clearly at the top of your report.
5. Update `docs/deploy.md` with a cutover checklist for connecting satoengineering.com to Vercel, **covering how to keep the company's email working**:
   - Record every existing DNS record before changing anything, especially **MX, SPF/TXT and any mail-related CNAMEs** for info@satoengineering.com.
   - Prefer adding Vercel's A/CNAME records at the current DNS provider over changing nameservers. If nameservers must change, recreate all the mail records first.
   - Steps for both `satoengineering.com` and `www`, the expected propagation time, and how to verify email still works after the switch (send and receive a test message).
   - How to roll back (restore the old A record) if something goes wrong.

## Done when

- Services and Projects show the same four infrastructure categories with the agreed names, in the same order; Oil & Gas is unchanged
- Every old-site project image is on the new site with its description, with no dates anywhere in project content
- New email images are placed by their descriptions, or listed if unplaceable
- Leadership is hidden and redirects; nothing links to it
- `npm run build:prod` passes, and all checks pass
- The branch is pushed with a preview URL

Report back with: the preview URL; screenshots of the Services dropdown, the Projects dropdown and landing page, one project page from each of the four categories, and the Sagamu project page (desktop and mobile); the check outputs; any photos you couldn't place; and the contact form status.

---

## How it was implemented

Branch `content/mirror-old-site`, on top of the prompt 17 work.

### 0. Review status

Every service in `services.json`, and the Infrastructure landing page, is
`"approved"`. The two Oil & Gas markers are gone and their notes are empty, so
nothing renders where they were: the brand list keeps its categories and names
with no "authorised", "official" or "distributor" anywhere, and the case study
keeps "a national oil company". Those three fields — `reviewStatus` and the
two `note`s — are the only difference in the Oil & Gas service; its project
facet is byte-for-byte unchanged.

### 1. Four categories

- **Services** (`services.json`, order 1–4): `building-construction` takes the
  buildings half of Civil Engineering & Construction (its building capability
  items, the Buildings solution, the McPherson header); `civil-engineering-road`
  takes the rest (roads, earthworks, drainage and erosion control, and the two
  road photographs in its gallery) and a new header cropped from a Life
  University road photograph not used anywhere else as a header or tile;
  `electrical-mechanical` merges the two pages — Capabilities keeps both item
  lists under "Electrical" and "Mechanical" subheadings, Solutions holds all
  nine groups; Water Resources is renamed with "and". Joining sentences only:
  "We deliver electrical and mechanical works as part of a wider contract or
  as packages in their own right, and we commission what we install" (from
  the two pages' own second paragraphs), and "A pump house is a civil
  structure, a mechanical installation and an electrical panel at once, and it
  is sequenced as one job" (the mechanical page's).
- **Infrastructure landing** (`pages/infrastructure.json`): the four
  types are the four new services, in order, each linking to its page.
- **Projects** (`pages/projects.json`): the four facets in the same order,
  labels identical to the service names. The Buildings and Roads & Pavements
  subheadings are gone because they are now categories; their "other
  photographs" moved with them. Tiles are all different photographs.
- **Project membership** follows the old site's pages: its Building and
  Construction table → 21 projects; its Civil Engineering Road Projects table
  (plus the APM pavement and the Ajebo road) → 9; its water table → 11.
  Electrical and Mechanical → the three meter supply contracts and Sagamu
  Intake and Ogere (pump panel, electro-mechanical scope), all five also kept
  under Water.
- **Routes**: `app/projects/building-construction`, `civil-engineering-road`,
  `electrical-mechanical`; the old category folders are gone.
- **Mirroring** is structural, not copied: the header dropdowns, the Services
  overview and the Projects landing all read `getServiceBands()` /
  `getProjectBands()`, which take their order and labels from the same content.
  The footer carries no category list (five links, by the client's earlier
  instruction), so there is nothing there to disagree.
- **Redirects** (`vercel.json`, 131): the six retired service and project
  routes, every earlier redirect that pointed at them re-pointed so nothing
  chains, and five bugs fixed on the way —
  - `/services/electrical-mechanical` was a redirect to the retired
    Electrical Engineering page. Vercel applies redirects before files, so it
    would have hidden the new page. Removed.
  - `/services/civil-infrastructure` and `/services/water-resources` were
    two-hop chains.
  - `/project-1/`, `/project-3/` and `/work-in-progress/` pointed at the
    wrong projects. The old pages show Lower Awba, the Lagos roads and the
    Mowe obstetrics facility; they now go there. `/horizon-suites/`,
    `/installed-high-lift-pump-panel/` and `/world-bank-team-inspection/` go
    to their projects instead of a category.
  - **No old link with a trailing slash would have matched.** Vercel compiles
    sources strictly (`@vercel/routing-utils`, `strict: true`), and every
    WordPress URL ends in `/`. Every source is now `/path{/}?`. Verified
    against Vercel's own compiler. `trailingSlash: false` was rejected because
    Vercel runs it before redirects, which would make every old link two hops.
  - `/?p=…` (old WordPress post IDs) redirected to `/` — its own path. Vercel
    carries the query string to the destination, so it would have looped.
    It now goes to `/projects`, like every `/707`-style post URL.
  Each redirect now states `statusCode: 301` (`permanent: true` gives a 308).
  `/leadership`, `/our-team/` and `/hse` are 302s: hidden, not gone.

  **Verified twice.** `npm run check:redirects` (in `build:prod`), and a
  replay of every source — with and without its trailing slash, with its
  query — through the routes Vercel's own `@vercel/routing-utils` compiles,
  against `/out`: 261 requests, every one landing on a live page in one hop
  (255 × 301, 6 × 302), and none of the 64 live pages caught by a redirect.

### 2. Old-site images

Done in prompt 17 and unchanged here except for their categories: every
old-site project photograph that may be published is on its project with its
caption beneath it. The 28 that are not are each excluded under a standing
rule, listed in `docs/content-audit.md` with the reason: 26 show people on an
active site without helmets (among them "World Bank Team Inspection of
on-going Sagamu Intake" and the Ogere high lift pump installation, which the
brief names as examples — the brief keeps the helmet rule), one shows children
at a tap stand, and one Lagos road photograph waits on the client. The old site
could not be re-fetched from this environment (its host is not on the
network allowlist); `docs/old-site-inventory.json` from 19 October was used.
No caption, title or narrative carries a date (section 4).

### 3. The resent email

The batch arrived as a zip of 11 files and **no `captions.txt`**. Compared by
`scripts/compare-photo-batch.mjs` (pHash, EXIF orientation applied), by the
original filenames in `scripts/client-photo-manifest.json`, and against the
two FUNAAB photographs prompt 17 took off the site (recovered from git):

| File | What it is | Outcome |
|---|---|---|
| `Creative Arts Building Unilag.jpg`, `… (2).jpg` | Already processed in October as W149 and W148 (manifest `originalFilename`), cropped to remove a signboard with the former name | **Skipped — already on the Unilag project** |
| `2f05e69a…` | Same photograph as the held `funaab-building-red-and-brick` (pHash 0) | **Held** |
| `4ced5baf…` | Same photograph as the held `funaab-building-courtyard` (pHash 2) | **Held** |
| `068d09d3…`, `cce587ff…` | White, red and brick FUNAAB building, no one on foot | **Held** — publishable once the building is identified |
| `2bbc6895…`, `cdec50db…` | Cream three-storey FUNAAB building around a courtyard, no people | **Held** — publishable once identified |
| `2829ddc5…`, `dc391f85…`, `e246f0e5…` | White, red and brick building; people on the active site without helmets (one on a ladder) | **Excluded** under the helmet rule |

The nine UUID-named files carry no description; the only one is the zip's
own name, "academic building FUNAAB". They show **two different buildings**,
and which FUNAAB project each is — Academic Building Complex Block B, COLPLANT
Phase II or the Administrative Block — is exactly the question prompt 17 left
open for the client ("The two FUNAAB buildings from WhatsApp"), and the old
site itself gives one courtyard photograph to two different projects. Placing
them on a guess would repeat the "photo on the wrong project" problem this
round started from, so per the brief ("no clear project → leave it out and
list it") they are held and listed in `docs/open-items.md`. None of the
eleven shows a burned-in date stamp.

**Settled after the first report.** The client identified the buildings:
**A, white, red and brick = Academic Building Complex Block B; B, cream
courtyard = COLPLANT Phase II.** Published: `068d09d3…` and `cce587ff…` on
Block B (its first photographs), `2bbc6895…`, `4ced5baf…` and `cdec50db…` on
COLPLANT, each captioned with the project's name, at their 1080px originals
(not upscaled), metadata stripped, and recorded in the manifest's `approved`
array with the original filename. `2f05e69a…` (near-duplicate) and the three
without helmets stay off. No email photograph shows the Sagamu pump
installation or the World Bank inspection the brief expected; the batch held
none.

Every file in `/public/images` is free of EXIF, GPS, XMP and IPTC —
`npm run check:images`, part of `build:prod`.

### 4. Dates

`showProjectDates: false`. No project title, summary, scope line, caption or
alt text carried a year after prompt 17, so no copy changed. The year field is
not serialised into any page (checked in the HTML and the flight payloads).
`scripts/check-dates.mjs` (`npm run check:dates`, in `build:prod`) scans every
project, category and landing page in full and every other page's captions
and alt text. Allowed: "since 1997" and the footer "© <year>". Tested the
other way round: with `showProjectDates` switched back on it fails with 78
dates.

**Oil & Gas, settled after the first report:** `/projects/oil-gas` listed the
partner team's projects with a Year column, which sat between "no dates" and
"leave Oil & Gas untouched". The answer was **remove the dates there too**. The
column — header, cells and the year set under the client on a phone — now
follows `showProjectDates` through `PartnerProjects`' `showDates`, the years
stay in the content, and the three bracketed years in the Halliburton row
("(2013)", "(2015)", "(2019)") are gone from its text. The date check has no
exception left. Nothing else on Oil & Gas changed.

### 5. Leadership

Hidden behind `showLeadership: false`: out of the nav (and so the mobile
menu), the footer, the sitemap and every link; no JSON-LD ever named a person;
route moved to `app/_leadership/` (a private folder, not routed). `/leadership`
and `/our-team/` 302 to `/about`. Its one placeholder — Afolabi Adeleke's job
title — is reported as on hold and no longer blocks `build:prod`; it blocks
again the moment the switch is turned back on. To restore: set
`showLeadership: true`, `git mv app/_leadership app/leadership`, delete the
`/leadership` and `/our-team` redirects.

### 6. Launch readiness

- `npm run build:prod` passes: placeholders → image metadata → build →
  banned terms and contact details → dates → redirects.
- `scripts/check-redirects.mjs` (`npm run check:redirects`): every redirect's
  destination is a page in `/out`, none chains, none hides a live page, every
  source matches with and without a trailing slash. Run against the old map it
  reports 151 problems.
- **`contactFormEndpoint` is empty.** The contact page says the form is not
  accepting submissions and shows the email address and telephone number.
- `docs/deploy.md` has the cutover checklist: record every DNS record first
  (MX, SPF/DKIM/DMARC TXT, mail CNAMEs), add Vercel's two records at
  Cloudflare rather than moving nameservers, both hostnames, propagation,
  an email test both ways with SPF/DKIM checked, and rollback.
- Screenshots: `docs/screenshots/launch-ready/`.
