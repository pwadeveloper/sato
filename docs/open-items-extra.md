<!--
  The hand-kept half of docs/open-items.md.

  One `## ` heading per group, matching the group headings in
  scripts/check-placeholders.mjs. Everything here is something the build
  cannot detect: a missing file, a photograph, a decision, a question about
  whether a fact is still true. `npm run check:placeholders` merges these
  sections into the matching generated group.
-->

## Answer these first

### From the service structure round

- **The new partnership line says Sato took part.** The Oil & Gas
  Partnerships section now reads: "Sato and its technical partners have
  delivered projects for independent, national and international oil
  companies across the Middle East, South America, North America, Africa,
  Europe and Australia." **Please confirm Sato was involved in those
  projects.** This is a change from how they have been attributed so far —
  everywhere else on the site the same work is labelled "Delivered by our
  technical partner team." If Sato *was* involved, we update the project
  attribution line to match. If it was not, we revert the sentence to "Our
  technical partners have delivered projects for…". Nothing else was changed
  in this round: `labels.partnerAttribution` and the Clients page are exactly
  as they were.
- **What counts as a client.** You defined a client as a company Sato
  delivers solutions to and gets paid by. The oil and gas list on `/clients`
  sits under the heading "clients served through our technical partners",
  which may not fit that definition. **Confirm whether that block stays.**
  Removing it is a content edit — the seventeen entries are the
  `oil-gas-partner` category in `content/clients.json`.
- **Partnerships for Infrastructure and Energy.** Every service page now has
  a Partnerships section. Infrastructure Services and Energy Services have no
  partnership information, so the section — and its item in the page's
  sub-nav — is simply absent from both. **Who are Sato's technical partners
  in these two areas, if any?** One or two sentences is enough; we do not
  need names if you would rather not print them.
- **Project photographs — stand-ins are in place.** Twenty-four of the
  forty-one projects have no photograph of their own, so their cards were
  blank panels. Each now shows a **generic photograph of Sato's work** for
  its category — a building site for Buildings, asphalt laying for Roads &
  Pavements, a pump control panel for Electrical, ductile iron pipes for
  Water Resources. **These are not photographs of those projects**, and they
  say so: the same frame repeats down the grid, the alt text for screen
  readers describes the photograph rather than the job, and none of them
  appears on a project's own page, where the gallery is headed "Project
  photographs". Each is replaced by dropping the real photograph into that
  project — nothing else changes. This is separate from the four service
  galleries you are sending photographs for.
- **Two recovered photographs are being held back.** Both came off the old
  site and neither is certain: one captioned "residential development under
  construction in Abeokuta" may or may not be the Akinyegun block of flats —
  **is it?** — and one of the Abeokuta office, which is not a project and
  could go on Contact or About if you want it there. **Say the word on
  either.**
- **US infrastructure reference site: awaiting link.** You mentioned a
  US-based infrastructure site to look at. Send the link whenever it is
  convenient; nothing is blocked on it.

## Client to confirm

### Client to send

Promised in the fourth round of feedback, nothing needed from us until it
arrives.

- **Digital twin content and related information.** Will update the
  Digitalization & Digital Twin Services page.
- **One consolidated document with additional slide content**, to follow the
  next meeting with the technical partner.

### Decisions from the two review calls

- **Oil and gas projects are attributed again.** You asked on the calls that
  partner projects carry an attribution line, and that the line appear
  automatically for the Digital Twin and Research projects Dele is sending.
  `/projects/oil-gas` therefore now opens with "Delivered by our technical
  partner team." **This reverses the instruction from the fourth round**,
  where the attribution came off — please confirm which you want, because the
  two rounds say different things. It is one string
  (`labels.partnerAttribution` in `content/pages/projects.json`); emptying it
  removes the line from every partner category at once. With the line on,
  `/clients` and `/projects/oil-gas` agree again, which settles the
  inconsistency raised last round.
- **Four project categories are waiting for content.** Mechanical
  Engineering, Energy Services, Digitalization & Digital Twin Services and
  Research, Technology & Innovation Services each have a category defined and
  **nothing in it**, so none of them is published — not in the Projects menu,
  not on the Projects page, not in the sitemap. Each appears by itself the
  moment its first project is added. Dele's Digital Twin and Research
  projects will be partner work and will carry the attribution line above.
  Each also needs a one-line description and a photograph for its tile when
  it goes live.
- **Photographs of completed work.** Send them whenever they are ready, in
  four batches — Civil Engineering & Construction, Electrical Engineering,
  Mechanical Engineering, Water Resources Development & Management — with the
  filenames you have given them. The site is ready for them: they go into a
  gallery on each service page. **Keep your filenames descriptive**; they are
  what the alt text for blind and partially sighted readers is written from.
  The process is `docs/adding-client-photos.md`.
- **The About photograph is a stand-in.** It is now one of your own tipping
  trailers, chosen because the Sato branding is legible on it — you asked for
  a photograph on that page that carries the mark. It replaced the completed
  road at the Federal College of Education, Osiele. **Still a stand-in**: send
  a better one and it is swapped in a line.

### Decisions from the fourth round of feedback

- **The bio, verbatim.** Your own version is now on `/leadership` word for
  word, with the country names kept for every institution, and the
  postnominals reordered to match it — FNSE, FNIEEE, FNIWE, FRICS. The
  no-country rule still applies to every other word on the site; the bio is
  the single exemption and the build enforces that it stays single.
- **One wording suggestion, for Mudia to raise — optional.** The third
  paragraph currently reads "a member of the Society of Petroleum Engineers
  (SPE), Nigerian Institute of Management, a Life Member…". Suggest to the
  client: "a member of the Society of Petroleum Engineers (SPE) **and the**
  Nigerian Institute of Management, a Life Member…". It reads as a list item
  dropped mid-sentence as it stands. **Not changed on the site** — it is his
  text and stays as written unless he approves.
- ~~**Oil and gas projects are now presented as Sato's own.**~~
  **Superseded by the review calls** — see above. The projects, the wider
  engagements and the case study are still at `/projects/oil-gas`, but the
  attribution line is back. The reservation about vendor verification is
  recorded in `docs/services-for-review.md`.
- ~~**The clients page does not yet match.**~~ **Resolved, in the direction
  of attributing both.** `/clients` keeps its "Oil & Gas: clients served
  through our technical partners" heading, and `/projects/oil-gas` now
  carries an attribution line too, so the two agree. If you would rather
  neither did, both come off in one edit each.

### Decisions from the third round of feedback

- **Final headings for two services.** You were deciding whether one of them
  should read "Oil & Gas Technology" or similar. Both names are unchanged for
  now — **Energy Services** and **Oil & Gas Services** — and each lives in one
  field (`name` in `content/services.json`), so a rename is a one-line change
  plus a redirect from the old URL. Send the wording when you have settled it.
- ~~**The bio wording, adapted.**~~ **Settled.** You sent your own version
  with the institutions named in full, and that is what is on the page. See
  the fourth round above.
- **Two sets of names for the same capabilities.** Your Home and About copy
  lists "Building, Civil Engineering & Infrastructure" and "Electro-Mechanical
  Services". The nav and the services pages say "Infrastructure Services",
  "Electrical Engineering" and "Mechanical Engineering". A reader meets both
  within one scroll. Your prose is used exactly as written and nothing has been
  reworded, but the two want reconciling — either the prose adopts the service
  names, or the services are renamed to match the prose.
- **Project dates.** You mentioned you may want them off. They are on, behind
  one switch: `showProjectDates` in `content/site.json`. Setting it to `false`
  removes every year from every card, category page and project page in one
  edit. Say the word.

### Project photographs

**28 of the 41 projects have no photograph.** Their cards show a plain panel
instead. It reads as deliberate rather than broken, but a page of them is
thinner than the work deserves, and these are the projects an oil company will
look at. Anything you can find — even a phone photograph — goes straight in.

**Civil Engineering & Construction — Buildings (15 of 21 with no
photograph)**

- Two-Storey Multipurpose Building with Offices (Academic Building Complex)
  Block B — Federal University of Agriculture, Abeokuta
- Construction and Furnishing of the Department of Creative Arts Building —
  University of Lagos
- Construction of Retaining Wall, Mariere Hall — University of Lagos
- Construction of 33 Lock-Up Shops — Ogun State Ministry of Special Duties
- Construction of Hotel Complex — Horizon Suites
- Construction of Obstetrics Care Facility — Ogun State Bureau of Management
  and Budget
- Construction of Primary Health Centre — National Primary Health Care
  Development Agency
- Construction of Guest Chalets — Joseph Ayo Babalola University
- Affordable Housing, Ogun State — Choice Investors
- Residential Building and Block of Flats
- Rehabilitation of Muda Lawal Stadium — Ogun State Ministry of Special Duties
- Classroom Construction and Hostel Fencing, School of Nursing — Ogun State
  Ministry of Special Duties
- Construction of Classrooms for SUBEB — Ogun State Universal Basic Education
  Board
- Construction of Classrooms — Ogun State Ministry of Education
- Construction of Multipurpose Hall — Abika Limited

**Civil Engineering & Construction — Roads & Pavements (6 of 9)**

- Reefer Pavement Works, Redesign, Construction and Repairs — APM Terminals
  Apapa Limited
- Road Construction Works at Sagamu Intake — Ogun State Water Corporation
- Internal Road Networks, McPherson University — Joint Magnate Investment
  Limited
- Construction of Ijohun-Igbokofi Road — Federal Ministry of Agriculture and
  Water Resources
- Rehabilitation of Roads with Asphalt Overlay — Qui Ventures Limited
- Improvement of Rural Roads, Kerbs, Culverts and Drainage — UNDP

**Water Resources Development & Management (7 of 11)**

- Construction of Sagamu Intake Structure — World Bank / Ogun State Water
  Corporation
- Supply of Prepayment and Electromagnetic Bulk Meters — World Bank / Federal
  Ministry of Water Resources
- Supply, Delivery and Installation of Immersion and Ultrasonic Bulk Meters —
  USAID E-WASH Programme
- Procurement of Domestic and Bulk Meters — World Bank / Ogun State Water
  Corporation
- Ajagunmolu Flood and Erosion Control — Federal Ministry of Environment
- Dredging of Omi Ogungbade River — Federal Ministry of Environment
- Dredging of River, Ijaiye — Ogun State Ministry of Environment

Also outstanding on the project record:

- **Project content.** You said you would work on this. Anything you send —
  corrected titles, scope, clients, missing projects — goes into
  `content/projects.json`.
- **Newer photographs generally.** The newest on file is from October 2019.
  See `docs/image-report.md`.
- **Years for four projects** — Reefer Pavement Works (APM Terminals), the
  E-WASH bulk meters, FUNAAB Administrative Block and the Ajebo asphaltic
  concrete road. They are shown without a date until you supply one.

### Brand assets

- **The updated logo file.** You have asked the original designer for it. The
  current mark is still in place and the swap is a file drop into `/brand/` —
  the sizing rules do not change.
- **A stacked vector lockup, if the designer can supply one.** The horizontal
  lockup is nearly 8:1 and cannot fit a phone header at a useful height, so
  small screens currently use a version extracted from the deck.

### The founder

- **A headshot.** The leadership page uses an initials block until one
  arrives.

### Offices

- **Is the Abeokuta street address still current?** The 2012 site gives
  "IBB Boulevard, opposite Southwest Resource Centre, Oke-Mosan, Abeokuta,
  Ogun State." The site currently shows the city and state only. If Oke-Mosan
  is still right we can put it back in one edit.
- **Any further offices to list?** The old site mentions Ibadan and Abuja.
  Neither is shown, and neither will be until you confirm it.

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

### One photograph withdrawn

- **The Owode Yewa shopfront** has a painted sign on the building abbreviating
  the country name. No check reads text inside a photograph, so it has been
  taken out of the hero set by hand. It is still available for the Owode Yewa
  project page if you would rather it were used there.

## Client and collaborator to confirm

- **Approve the Oil & Gas page.** The full text is in
  `docs/services-for-review.md`. The page is now four sections — Capabilities,
  Solutions, Projects, Partnerships — with the partner team's record under
  Projects and the relationship under Partnerships. The production build is
  blocked until it is approved.
- **Approve the oil and gas client list.** Seventeen names now appear on
  `/clients` under the heading "Oil & Gas: clients served through our
  technical partners", clearly separated from Sato's own clients. It is behind
  the same review gate as the Oil & Gas page.
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

## On hold

- **The Oil & Gas in-page sub-nav.** Capabilities · Solutions · Projects ·
  Partnerships, exactly as it was — you asked to discuss it before anything
  comes off. The only change made was to the *menus*: "Projects" no longer
  appears under Oil & Gas in the Services dropdown or on the Services page,
  because Projects has its own nav item and both pointed at the same page.
- **The Lagos address format.** You mentioned showing the area and a nearby
  bus stop in brackets, the way the live site does: "No 14 Agbaoku street
  (Awosika bus stop), Opebi, Ikeja, Lagos State." The site currently reads
  "No. 14 Agbaoku Street, Opebi, Ikeja, Lagos" with "Near Awosika bus stop."
  underneath. Unchanged until the contact page is revisited.
- **The Leadership page.** Untouched. You are adding two or three more
  people, and the page will be restructured once they are in.
- **The hero and header photographs.** You mentioned "the hero image" being
  too large on the Oil & Gas page; we read that as the business value map
  diagram, which is now a fifth smaller. No header photograph has been
  resized — say the word if you meant one of those instead.
- **The HSE page.** Not built, not linked, not in the sitemap. `/hse` and the
  old `/safety-policies/` both redirect to `/about`. The content is kept,
  rewritten, in `content/pages/hse.json`. Restoring it means re-registering
  the page in `lib/content.ts`, adding `app/hse/page.tsx` back, putting HSE
  into the nav and footer in `content/site.json`, and dropping the `/hse`
  redirect from `vercel.json`.
- **The Home components that are no longer used.** "What we do", the company
  data plate, the client strip, selected projects and the closing call to
  action are off Home but still in `/components`, working, because you said
  you want to build on the page later. Nothing imports them; nothing has to
  be rewritten to bring one back.
