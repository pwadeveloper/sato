The client has sent real photos of Sato's work: a Word document from a staff member with embedded pictures, plus folders of photos from project sites. Your job is to go through all of it, propose the best photos for each place on the site, **wait for my approval**, then publish them.

This prompt runs in **two phases with a hard stop between them**. Do not map any photo into the site until I've approved the selection.

Save this file as `docs/decisions/client-photos.md`. Commit nothing.

---

## Where the files are

Everything is in `raw-assets/client-photos/_inbox/` (already gitignored), exactly as the client sent it:
- one or more `.docx` files with embedded pictures
- folders of photos (possibly nested, possibly mixed formats: JPG, PNG, HEIC, maybe screenshots or WhatsApp images)

**Never rename, move or edit anything inside `_inbox/`.** The client's folder names and filenames are often the only record of which project a photo shows. Work on copies.

---

## Phase 1 — Extract, filter, propose (then stop)

### 1. Extract the photos from the Word document(s)

For each `.docx` in the inbox:
- Unzip it (it's a zip archive) and copy every image from `word/media/` into `raw-assets/client-photos/_work/docx/<document-name>/`.
- **Capture the context for each image:** parse `word/document.xml` together with `word/_rels/document.xml.rels` to find where each image appears in the document, and record the text immediately before and after it (headings, captions, paragraph text). This is usually the best clue to which project the photo shows.
- Convert any EMF/WMF images to PNG.
- Write `raw-assets/client-photos/_work/docx-index.json`: for each image, its file, the document, its position in the document, and the surrounding text.

### 2. Gather everything into one working set

- Copy all photos from the inbox folders into `raw-assets/client-photos/_work/all/`, keeping the original relative path in a manifest (not in the filename alone).
- Convert HEIC to JPG. Fix orientation using EXIF rotation, then remember the photo is now upright.
- Record for every image: source (docx or folder), original path, pixel dimensions, file size, and EXIF date taken if present.

### 3. Pre-filter with a script before looking at anything

There may be hundreds of photos. Don't view them all one by one. Write `scripts/filter-client-photos.mjs` (sharp, plus a perceptual hash) that:
- **Drops near-duplicates:** groups photos by perceptual hash and keeps the largest/sharpest of each group.
- **Drops low resolution:** anything under 1200px on the long edge is flagged "too small for headers" (it may still be usable for small gallery thumbnails at 800px+; below 800px, drop it).
- **Drops blurry shots:** compute a sharpness score (variance of the Laplacian) and flag the bottom fifth.
- **Drops non-photos:** screenshots, scanned documents, plans and drawings (unless a drawing is clearly useful), images that are mostly text.

Report the counts at each stage (total → after duplicates → after size → after blur → candidates).

### 4. Review the candidates and propose a selection

Look at the remaining candidates and propose photos for these places:

| Place on the site | What's needed |
|---|---|
| **About page, right-hand image** | Replace the current truck photo (the truck has been sold). The client wants something representing current work, ideally **water industry work**. Propose either one strong water-project photo, or a 2×2 collage of four water-project photos. Show me both options. |
| **Anywhere else the truck appears** | Search the site for every use of the truck image and propose a replacement for each. |
| **Infrastructure Services sub-pages** | A header image and three to six gallery photos each for Civil Engineering & Construction, Electrical Engineering, Mechanical Engineering, and Water Resources Development & Management. |
| **Projects** | A photo for every project that currently has none (28 of them), plus better photos for projects whose current image is low quality. |
| **Projects landing tiles** | One strong photo per visible category. |
| **New projects** | The client mentioned a recent photo of a **University of Lagos (Unilag) building** and an **academic building at a university whose name was unclear in the call notes** ("University of Aguocha"). If you find photos of these, don't create projects for them. List them separately; I'll confirm project details with the client. |

**Rules for matching photos to projects:**
- Only match a photo to a specific project when there's real evidence: the folder name, filename, the surrounding text in the Word document, or a visible sign or landmark. **Never guess.** A photo of an unidentified building site is not "the FUNAAB Academic Building".
- Give every match a confidence level: **High** (named in folder, filename or caption), **Medium** (strong visual or contextual evidence, explain it), or **Low** (plausible but unconfirmed). Don't propose Low matches for specific projects; put them in the unassigned pool.
- Photos you can tell are, say, water works but can't tie to a project go into a service gallery (e.g. Water Resources Development & Management), not onto a project page.

**Content rules:**
- Prefer photos without identifiable people. Workers in the distance in PPE are fine; close-up faces are not, unless they're clearly posed staff photos (flag those for me).
- Exclude any photo showing the sold truck, vehicle number plates, or anything unsafe on site (people without helmets or in obviously dangerous positions). Oil and gas visitors will notice poor safety practice.
- Exclude photos with visible personal information (documents, screens, phone numbers on signs other than Sato's own).
- Prefer completed work for project pages; progress photos are fine for galleries.

### 5. Build the review page and stop

Create `raw-assets/client-photos/_work/review.html` (open it locally; don't publish it), with:
- A section per place on the site (from the table above), showing each proposed photo as a thumbnail with: its original filename and folder, its source (docx caption text if from the Word document), the confidence level and the reasoning, and its dimensions.
- For the About page, both the single-photo option and the collage option.
- An "Unassigned but good" section: strong photos you couldn't match, grouped by apparent type (water, roads, buildings, electrical, mechanical, other).
- A "Possible new projects" section (Unilag and the second university).
- A short "Excluded and why" summary (counts by reason, plus thumbnails of anything you excluded for safety or privacy, so I can double-check).
- Give every proposed photo a short ID (e.g. `P014`) so I can approve or reject by ID.

Then **stop** and tell me:
- The filtering counts from step 3.
- How many places you could fill, and which still have no suitable photo.
- Anything you need me to ask the client (unidentified sites, the university name).

**Do not continue to Phase 2 until I reply with approvals.**

---

## Phase 2 — Publish (only after my approval)

I'll reply with the IDs I approve, reject or want moved. Then:

### 6. Process the approved photos

Extend `scripts/optimise-images.mjs` so that, for approved photos only:
- **All metadata is stripped**, including GPS location, camera details and date. Check this: confirm with a script that no output file contains EXIF/GPS data, and report the result.
- Output WebP at 1920px (headers) and 800px (cards, galleries) as before; keep the aspect ratio. Crop headers to the site's header ratio with a sensible focal point, and tell me about any crop that cuts off something important.
- Output into `public/images/services/<service>/`, `public/images/projects/<project-slug>/` and `public/images/about/`.
- Use descriptive filenames (e.g. `ogere-water-scheme-pump-house.webp`), not the client's originals. Keep the mapping from new name to original filename in `scripts/client-photo-manifest.json` so we can always trace a photo back.

### 7. Map them into the site

- **About page:** replace the truck photo with the approved option. If the collage was chosen, build it as a CSS grid of the four images (not a single merged image), keeping the sticky behaviour from prompt 14. Keep the AI-generated image on the left side of the site as it is; the client is happy with it.
- Replace every other use of the truck image.
- Add approved photos to each service's `images` array in services.json (header plus gallery) so the ServiceGallery from prompt 14 renders.
- Add approved photos to each project in projects.json. The first image becomes the card image.
- Update the Projects landing tiles.
- Every image gets real alt text describing what it shows (e.g. "Pump house at the Ogere water supply scheme"). No "image of" and no filenames.
- Remove any image files that are no longer used (the truck photo and anything replaced), and confirm nothing references them.

### 8. Update the open items

Regenerate `docs/open-items.md`: which projects still have no photo, the possible new projects awaiting details, and anything to ask the client.

## Done when (Phase 2)

- The truck photo is gone from the whole site
- The About page right-hand image shows real water work, as approved
- The four Infrastructure service pages show their galleries
- Every project with an approved photo shows it; no photo is matched to a project without High or Medium confidence
- No published image contains EXIF or GPS data (verified by script)
- Every image has meaningful alt text
- `npm run build` passes, and the banned-terms and contact checks still pass (check that no photo contains a visible phone number or email other than Sato's)

Report back with screenshots of the About page, one Infrastructure service page with its gallery, the Projects landing page and two project pages (desktop and mobile), plus the metadata check result and the updated `docs/open-items.md`.

---

## Phase 2 — what was done

Phase 1 found 153 images (142 in `Pictures.docx`, 11 loose JPGs) and cut them
to 122 candidates: total 153 → after duplicates 152 → after size 152 → after
blur 122 → candidates 122. Nine photos the blur filter dropped were reinstated
after inspection, because large plain walls and skies score as "blurry". The
review page proposed 98 placements.

### Rulings given at approval

- **Approved:** every High and Medium proposal. Nothing rejected or moved.
- **About:** the four-photo collage, as a CSS grid. The photos are from 2009–2012,
  and recent water work will replace them.
- **The former name in photos.** No masking or painting over. Crop the text
  out if the subject survives the crop. If it doesn't, use the photo only at
  800px, and only if the text isn't legible at that size. Otherwise drop it.
- **Safety:** remove ogere-2, -5, -6, -11 and -12, and apply the same rule to
  every image already on the site.
- **lagos-road-1:** comes off the Amuwo Odofin project. Not published
  anywhere until the client confirms what it shows.
- **The WhatsApp buildings** are at FUNAAB (client confirmed). Assign them to
  a FUNAAB project only if the building can be identified; otherwise put them
  in the Civil gallery, with alt text that names FUNAAB but no specific building.
- **Don't publish any photo that depends on an open question.**

### How each ruling was applied

**The former name and other legible text**, photo by photo:

| Photo | Text | Applied |
|---|---|---|
| W054 drilling rig | decal on the compressor | 1 — cropped (right 22% off) |
| W056 drilling crew | printed hi-vis vest | 1 — cropped to the rig and crew |
| W148 Unilag | project signboard (former name, street address) | 1 — cropped (bottom off) |
| W149 Unilag | the same signboard | 1 — cropped (bottom off) |
| W051 Owode shops | tenant's sign abbreviating the country | 1 — cropped (right third off) |
| W057, W061, W062, W063, W064 boreholes | project signboards | 3 — dropped: a crop leaves only a pump house or half a tank, and the board is legible at 800px |
| W074 pump installation | printed vests | dropped first on the helmet rule, so the text ruling never came into it |

No photo was published under ruling 2. The site's existing borehole photos
stay: at about 580px their boards can't be read.

**The helmet rule, applied to everything.** Plant operators seated in a cab
or under a canopy count as safe. Anyone else on site needs a helmet.

- Removed from the live site, beyond the five named: **ogere-3** (pipe
  offloading under a crane load; it was the Projects page header), **ogere-7**
  (pump installation), **ogere-9** (tank foundations), **fiditi-3** (two people
  by the excavator), **awba-1** (a man on the excavator track),
  **roadworks-asphalt-compaction** and **roadworks-asphalt-laying** (paving
  crews close up), **water-meter-installation** (meter fitter), and
  **water-sagamu-intake-inspection** (a site group, mostly without helmets).
- Dropped from the approved set for the same reason: W074 (the original of
  ogere-7), W090, W113, W124, W128 (the original of fiditi-3).
- Checked and kept: fce-osiele-4 (figures too small to judge, one apparently
  helmeted), boreholes-2 (members of the public at a finished facility),
  water-meter-training (an office training session).

**Held back pending the client's answers** (see `docs/open-items.md`, "Client
to confirm: photos"): the Omi river set (W103–W106; the Water Resources
header uses the Arakanga filter instead), Mabunmi Junction (W112, W114,
W119, W120), Sagamu (W098–W102), the Lagos road set including lagos-road-1
(W006, W014–W016), and W013.

**FUNAAB.** Neither building could be identified. Building A (red, white and
brick, three storeys or more) is not COLPLANT (two storeys, tan) and not
Block B (described as two-storey). Building B (cream, round a courtyard)
resembles the Administrative Block, but nothing confirms it. One photo of
each is in the Civil Engineering & Construction gallery (W146, W147).

**The truck** was only on `/about`. It is replaced by the collage, and the
file is deleted along with its `equipment.json` reference.

**Header crops** are cut to 16:7, the header band's ratio from `sm` up.
Two lose something: the mechanical header (W054) loses the top of the drilling
mast, and the electrical header (W094) cuts the top row of breakers. The civil
header's focus was raised so the building isn't clipped.

**Metadata.** Every file is re-encoded without metadata, and
`npm run check:images` reads every published image's container: 192 files,
no EXIF, GPS, XMP or IPTC. A planted GPS-tagged control file was caught.
