<!--
  The hand-kept half of docs/open-items.md.

  One `## ` heading per group, matching the group headings in
  scripts/check-placeholders.mjs. Everything here is something the build
  cannot detect: a missing file, a photograph, a decision, a question about
  whether a fact is still true. `npm run check:placeholders` merges these
  sections into the matching generated group.
-->

## Client to confirm

### Client to send

Promised in the fourth round of feedback, nothing needed from us until it
arrives.

- **Digital twin content and related information.** Will update the
  Digitalization & Digital Twin Services page.
- **One consolidated document with additional slide content**, to follow the
  next meeting with the technical partner.

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
- **Oil and gas projects are now presented as Sato's own.** On your
  instruction, the partner team's twenty-six projects, the wider engagements
  and the case study moved to `/projects/oil-gas` and the attribution lines
  were removed. The reservation about vendor verification is recorded in
  `docs/services-for-review.md`; the decision is yours and the site reflects
  it.
- **The clients page does not yet match.** Seventeen oil and gas clients on
  `/clients` still appear under "Oil & Gas: clients served through our
  technical partners". Nobody asked for that to change, so it has not been
  touched — but a reader now meets attributed clients and unattributed
  projects on the same site. **Which way should it go?** Both can match in
  one edit.

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

**Buildings & Construction (15 of 21 with no photograph)**

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

**Civil Engineering & Roads (6 of 9)**

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
