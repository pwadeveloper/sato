New client photos: 11 unlabelled pictures in raw-assets/client-photos/_inbox/batch-2026-11-10/. The client explained them verbally, so identify each one by looking at it, using the breakdown below. Same branch; commit and push for a new preview.

FIRST: compare with everything already processed (perceptual hash). These may overlap with the October email batch. Then sort the 11 into these groups and show me the grouping (thumbnail + filename) at the top of your report:
- 4 × pumps and electrical equipment (transformers, generators, pumps)
- 1 × COLPLANT building (FUNAAB College of Plant Science), a better angle than the current one
- 4 × World Bank officials visiting sites
- 1 × water tank (the same tank as the current main water image, but clearer)
- 1 × surveyor using a levelling instrument
If a picture doesn't fit any group, or a group's count doesn't match, leave the extras out and tell me.

PLACEMENT
1. Pumps/electrical (4): add to the Electrical and Mechanical category (and its service page gallery). No captions; the client says site visitors will recognise the equipment. Alt text should still describe what's shown (e.g. "Pump installation", "Transformer", "Generator set").
2. COLPLANT (1): replace one existing COLPLANT photo, the weakest angle, with this one, on the COLPLANT project and in Building and Construction. Keep its COLPLANT caption.
3. World Bank officials (choose 1–3 of the 4): place them across the site where they fit best (e.g. the Water Resources category, the Sagamu intake project, Electrical and Mechanical). Caption every one exactly: "World Bank officials visiting site". No place names (don't mention Sagamu or anywhere else). Prefer photos where the visitors are wearing PPE; if one shows people without helmets on an active construction area, don't use it.
4. Water tank (1): make it the main (spotlight) image for Water Resources Development and Management, replacing the current one. Keep the old tank photo in the Water gallery, not as a spotlight. Caption: "Overhead water tank", with no location.
5. Surveyor (1): add to Civil Engineering and Road. Caption: "Survey and levelling works".

ABOUT PAGE IMAGE
The client finds the current About image too basic. Propose three alternatives from photos already on the site or in this batch (strong, clear, people in PPE or a substantial structure; not one already used as a category spotlight). Apply the one you think is strongest, and include all three as screenshots so I can switch if the client prefers another.

RULES (unchanged): no place names in Water and Road captions (except the two water meter captions), no dates, no "Nigeria", strip all metadata and verify, one photo in one place, no unsafe site practice.

Report with: the grouping table; screenshots of the four category spotlights, the Electrical and Mechanical page, the COLPLANT project and the About page with its three options (desktop and mobile).

---

## What was done

### Already on the site? No

`node scripts/compare-photo-batch.mjs raw-assets/client-photos/_inbox/batch-2026-11-10 --against=raw-assets/client-photos/_work/all --against=raw-assets/old-site --against=raw-assets/client-photos/_work/water-2026-11-08`:
all 11 are new. The nearest match for any of them is pHash 18 (≤ 10 is the
same photograph), so none of them is in the October email, either Word
document or the old site.

### The grouping

Sorted by eye; it matches the breakdown, 4 + 1 + 4 + 1 + 1, with nothing left
over. Contact sheet: `docs/screenshots/photo-batch-2026-11-10/grouping.jpg`.

| Group | Files | Outcome |
|---|---|---|
| Pumps and electrical (4) | `25072008005.jpg`, `25072008007.jpg`, `25072008013.jpg`, `25072008011.jpg` | All four published (no generator among them: two split-case pumps, the motors and their transformers) |
| COLPLANT (1) | `IMG_20200820_125640_11.jpg` | Published; replaces the old site's lead photograph |
| World Bank officials (4) | `P1030364.JPG`, `P1030369.JPG`, `P1030924-1.JPG`, `P1030932 (1).JPG` | All four published; two were held in the first round and added the same day (below) |
| Water tank (1) | `S6300021.JPG` | Published; the Water spotlight |
| Surveyor (1) | `3599d113-f3e7-4177-862e-126a034fbe43.JPG` | Published |

All 11 are upright (EXIF orientation 1 or none), so the selection entries
read the inbox files directly, as the 8 November email did. Working IDs are
`B-` plus the filename. Ten carry EXIF in the original; none survives
`npm run images` (`check:images`: 344 files, no EXIF, GPS, XMP or IPTC).
None shows a burned-in date or a number plate.

### Placement

- **Electrical & Mechanical (4).** In the category's own `photos` (no
  project: the photographs name no site) and, as the brief asks, in the
  service page's gallery ("Work delivered"), which had been empty since 9
  November. No captions; alt text describes the equipment. That is the one
  photograph-in-two-places on the site that is not a project photograph plus
  one tile or header. The content audit allows exactly that pairing, a
  category's photograph in the gallery of the service that category mirrors,
  and reports it as "Duplicate (allowed, 10 November)". `ServiceGallery` lays
  out four photographs 2×2 rather than three and one.
- **COLPLANT.** The new photograph is the same front as the old site's lead
  photograph (`funaab-colplant-1`), from the corner rather than straight on,
  without the car bonnet and the hanging branch. That is the weakest of the
  exteriors and the one this is "a better angle than", so it is replaced, and
  the new photograph keeps its caption word for word ("Work in progress
  (completion stage) at College of Plant Science …"). It is the project's
  first photograph and so leads Building & Construction. It is 1080×495, about
  the size of the one it replaces. The mirror plan marks the old-site copy
  `excluded` on the client's instruction, so the audit explains it ("Missing
  photo": 3, from 2). The old file stays in `public/images`.
- **World Bank officials.** Captioned exactly "World Bank officials visiting
  site".
  - `P1030364` (the visitor in a hard hat, in discussion with the project
    team) → **Water Resources category photographs**, after the drilling rig.
    Published at 800px only: the small print under the logo on his helmet
    carries the former name and is partly legible at 1920px. October's
    800px ruling, as on the Sagamu inspection photograph.
  - `P1030369` (the same visitor in a hard hat, walking a newly surfaced road
    with the project team) → **Civil Engineering & Road category
    photographs**, after the completed road section. The road is finished, and
    nothing in frame is under construction. The helmet print can't be read at
    1920px.
  - Neither is on a project. Their camera numbers sit ~500 frames before the
    Sagamu inspection photograph (`P1030872`), with different people, so
    nothing ties them to a site. Not on the Sagamu intake project for that
    reason.
  - **First round, left out:** `P1030924-1` (no helmets in the foreground,
    an excavator working behind) and `P1030932 (1)` (two vests legibly read
    "SATO RC 317208 ENGINEERING NIGERIA LIMITED").
  - **Same day, published** on the instruction that the client wants every
    photograph in the batch used. The helmet rule was already waived (9
    November). Both are from the Sagamu visit's camera series (the old site's
    inspection photograph is `P1030872`, 50–60 frames earlier, with the same
    visitor), so both are on the **Sagamu intake structure** project:
    `world-bank-visit-excavation` (`P1030924`) in the Water gallery, and
    `world-bank-visit-briefing` (`P1030932`) with `galleryCategory`
    Electrical & Mechanical, as the brief suggested. `P1030932` is cropped to
    the visitor (left 5%, right 28% off), which takes the print off both
    vests; nothing legible remains. On `P1030924` the only text is the
    excavator's "CAT", "SATO" and "320BL"; no plate shows.
  - So all four World Bank photographs are up, each captioned exactly as
    asked. That puts the caption on the Water page twice (Sagamu, and
    `P1030364` among the category photographs, far apart). The brief's exact
    wording wins over the no-repeat rule there.
- **Water tank → Water spotlight.** Placed on the Ogere project, after the
  ground tank it replaces as spotlight, because the spotlight must be a
  photograph of a project in its category and the client says it is the same
  tank. The ground tank stays on the project, so it stays in the Water
  gallery. Spotlight `focalPoint` `50% 15%`, which keeps the clarifier ring
  in the 16:6 band.
  - **Caption: "Water treatment tanks", not "Overhead water tank".** The
    photograph shows ground-level round tanks at a working treatment plant:
    a clarifier with its scraper bridge, filter channels and red-railed
    walkways. Nothing in it is an overhead tank, and the Ogere page already
    has a real one ("Constructed overhead tank", the steel tower). Two
    captions saying "overhead tank" under two different structures on one
    page would be wrong for an engineer to read. If the client still wants
    his wording, it is the `caption` on the `treatment-tanks` image in
    `content/projects.json`.
  - By eye it is not obviously the same structure as the ground tank (that
    one is under construction among roofs; this is a finished plant among
    trees). The site rests on the client's word, recorded in the selection
    entry's `placement`.
  - One operator is crouched on the walkway by the stair rail, top left,
    without a helmet. This is an operating plant, not a construction site, he
    is behind the tank wall, not on it, and he is about 30px tall in the
    desktop band. Kept.
- **Surveyor → Civil Engineering & Road category photographs**, first of
  them, captioned "Survey and levelling works". Published at 640px: the
  small print under the logo on his vest carries the former name and is
  faintly legible at the original 864px and at 800px; at 640px it is a
  smudge. The vest is the subject, so no crop clears it. A portrait sits
  whole in the gallery's 4:3 frame, so 640px is enough. The container
  terminal behind him (Maersk boxes, gantry cranes, broken-out pavement by a
  kerb) points to the APM Terminals reefer pavement project, which has no
  photograph. It is not placed there until the client confirms.

### About

The current photograph (Arakanga sand filter, water and foam) is replaced by
**the borehole drilling crew**: everyone in frame in a hard hat, at the rig,
water work, sharp at 1920px. It is a photograph of the solar-powered boreholes
project used once more as a page image, the same allowance as a header. The
About template now honours `focalPoint` on the aside, as `PageHeader` does;
`70% 50%` keeps the rig and both pipe handlers in the 3:4 desktop frame (the
supervisor in his vest shows on mobile).

The other two, for the client to choose between
(`docs/screenshots/photo-batch-2026-11-10/about-option-*`):

| Option | Photograph | Why | To switch |
|---|---|---|---|
| **A (applied)** | Borehole drilling crew (`projects/solar-powered-boreholes/borehole-drilling`) | People in full PPE doing water work | — |
| B | Pump motors and transformers (`projects/electrical-mechanical/pump-motors-and-transformers`), from this batch | A substantial electro-mechanical installation | `images.aside` in `content/pages/about.json`, `focalPoint` `45% 50%`; then take it out of the E&M service gallery, or it would be in three places |
| C | COLPLANT courtyard (`projects/funaab-colplant-building-phase-ii/courtyard-1`) | The strongest building photograph on the site | Same field, `focalPoint` `35% 50%`; it is 1080px, so a little soft on a large desktop |

None is a category spotlight. The Arakanga file stays in `public/images`
and in the selection file, so going back is a one-line edit.

### Checks

- `npm run build:prod`: placeholders, image metadata (344 files clean), build,
  banned terms, dates, redirects (131).
- Content audit: 0 duplicates, 0 wrong projects, 0 changed captions;
  "Duplicate (allowed)" 16, which includes the four E&M photographs;
  "Missing photo" 3: the tap-stand children, the second pump-house
  photograph and now the old COLPLANT lead, each with its reason.
- No new caption names a place. The COLPLANT caption carried over is one of
  the two allowed COLPLANT captions.
