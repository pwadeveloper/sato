# Open items

Everything the website still needs, grouped by who has to answer it.

**2 placeholders outstanding** and **6 services awaiting approval.** Generated 2026-09-26 by `npm run check:placeholders`, so the detected items are always current. The rest is kept by hand in `docs/open-items-extra.md`.

A placeholder is text that is visible on the site right now. The production build is blocked until every one is resolved and every service is approved.

---

## Client to confirm

Questions for Sato. Everything here is either visible on the site as a placeholder, or a service whose copy is written but not yet approved.

### Services awaiting approval

These describe what each service offers. They are capability descriptions, not claims of work already delivered. The full text is in `docs/services-for-review.md`.

- **Electrical Engineering**
- **Mechanical Engineering**
- **Energy Services**
- **Digitalization & Digital Twin Services**
- **Research, Technology & Innovation**

### Offices

- **Is the Abeokuta street address still current?** The 2012 site gives
  "IBB Boulevard, opposite Southwest Resource Centre, Oke-Mosan, Abeokuta,
  Ogun State." The site currently shows the city and state only, with no
  placeholder, because the brief said the street address was to follow. If
  Oke-Mosan is still right we can put it back in one edit.
- **Any further offices to list?** The old site mentions Ibadan and Abuja.
  Neither is shown, and neither will be until you confirm it. `offices` in
  `content/site.json` is an ordered list, so adding one is a content edit.

### The founder

- **Updated bio for Engr. Wale Osamiluyi.** The current one is carried over
  from the 2012 site.
- **Fellow or Member?** The display name on the site now reads
  "Engr. Wale Osamiluyi, FNSE, FNIEE, FNIWE" as instructed, but the bio
  carried over from 2012 lists MNSE and MNIM — Member, not Fellow. The two
  contradict each other on the same page. A procurement officer checking
  credentials will notice, so this wants settling before the letters go out.
  FNIEE and FNIWE are not in the memberships list at all yet.
- **A headshot.** The leadership page uses an initials block until one
  arrives.

### Brand assets

- **SVG logo files.** `/brand/` holds raster only: `Black.png` (2507×318),
  `White.png` (1843×229) and `sato-logo-from-deck.png` (680×267). The header
  now shows the mark at 64px on desktop, which the PNGs still serve sharply
  at 2x, but vector would be better for the header, footer, favicon and the
  Open Graph card. **A stacked vector lockup is worth asking for too** — the
  horizontal one is nearly 8:1 and will not fit a phone header at any useful
  size, so the mobile header currently uses a version extracted from the
  deck.

### Recognition

- **The "Most Supportive Indigenous Company (2012)" award has been removed.**
  Its official title contains a word the company no longer uses, and
  paraphrasing an award would misquote it. Say the word if you would rather
  it went back in under its real title. The other six awards are unchanged.
- **Awarding bodies for the two 2012 awards** were recovered from the live
  site and are already on the About page: the Institute of Government
  Research and Leadership Technology, and the West African Nobles and Top
  Entrepreneur Forum with Aspire West Africa.

### Project record

- **Newer project photographs.** The newest on file is October 2019. See
  `docs/image-report.md` for the full request.
- **Years for four projects** — Reefer Pavement Works (APM Terminals), the
  E-WASH bulk meters, FUNAAB Administrative Block and the Ajebo asphaltic
  concrete road. Not on the live site either; they are shown without a date
  until you supply one.

### Registrations and access

- **Oil and gas registrations** (NOGICJQS, NipeX, NUPRC) if Sato holds them.
  The registrations block is hidden while the list is empty.
- **Hosting and domain access** for the cutover. DNS is on Cloudflare and the
  MX records point at Google Workspace — see `docs/deploy.md`.

### One person outstanding

- **Popoola Oyenola** (Executive Director, Projects & Development) appeared in
  neither the "remove" list nor the "no answer" list on the form. He is held
  as unpublished — off the site entirely — pending your word on whether he is
  still with Sato.

---

## Client and collaborator to confirm

The oil and gas service describes a joint offer and quotes the partner team's track record, so both Sato and its technical collaborator have to approve these before the page can be published.

### Services (shared)

- **brand names may be listed publicly; confirm whether Sato or its partner holds any authorised distributor status**

  > _(the whole field is this question)_

  <sub>content/services.json → `[5].procurement.note`</sub>

- **can the case study client (ADNOC) be named?**

  > _(the whole field is this question)_

  <sub>content/services.json → `[5].partner.caseStudy.note`</sub>

### Services awaiting approval

These describe what each service offers. They are capability descriptions, not claims of work already delivered. The full text is in `docs/services-for-review.md`.

- **Oil & Gas Services**

- **Approve the Oil & Gas page.** The full text is in
  `docs/services-for-review.md`, including a note on how the partner team's
  work is attributed. The production build is blocked until it is approved.
- **May we name the technical partner?** `partner.name` in
  `content/services.json` is empty and the line is hidden. One edit turns it
  on.
- **Settle the headline figures.** The source gives 170, 250+ and 280+
  projects; 6 and 8 patents; 13 and 15 countries; 25+ years and "over 200
  years combined"; 150+ publications. Nothing is published while they
  disagree — `partner.figures` is empty and the strip is hidden. Send one set
  of numbers and they go in.
- **May the case study client be named?** The page says "a national oil
  company"; the source says ADNOC.
- **Brand list and distributor status.** The equipment section lists
  manufacturers by name. Confirm they can be listed publicly, and whether
  Sato or the partner holds any authorised distributor appointment. The words
  "authorised", "official" and "distributor" are deliberately not used
  anywhere on the page until that is confirmed.
- **HSE content.** The page is unpublished (see below). The 2012 safety
  policy covers neither incident reporting nor quality assurance, and oil
  company pre-qualification normally asks about both.

---

## On hold

Decided, but deliberately parked. Nothing here blocks the build — it is recorded so it is not lost.

- **The HSE page.** Not built, not linked, not in the sitemap. `/hse` and the
  old `/safety-policies/` both redirect to `/about`. The content is kept,
  rewritten, in `content/pages/hse.json`. Restoring it means re-registering
  the page in `lib/content.ts`, adding `app/hse/page.tsx` back, putting HSE
  into the nav and footer in `content/site.json`, and dropping the `/hse`
  redirect from `vercel.json`.
- **Splitting the Technology category.** Digitalization & Digital Twin and
  Research, Technology & Innovation currently sit together. Separating them
  is a content edit: give one of them a new `group` value in
  `content/services.json` and add the matching `group…` labels to
  `content/pages/services.json`.

---

## How to answer

Each placeholder shows the question in bold and, underneath it, the sentence it appears in — `[ ? ]` marks the exact spot. Reply against the bold question; the small grey line is only there so we can find the right field.

Anything you cannot answer yet, say so and we will decide together whether to cut the sentence or hold the page back.
