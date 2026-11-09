Client feedback on the project photos and captions. Goal: the project pages should feel varied, not repetitive or heavy with place names. This overrides the caption rules from prompts 17 and 18 where they conflict. Work on the same branch; commit and push for a new preview.

1. REMOVE LOCATION NAMES FROM CAPTIONS (Water Resources, and Civil Engineering and Road)
- Strip every place name from photo captions in these two categories (e.g. Ogere, Fiditi, Atositegu, Sagamu, Osiele, Awba, Ibadan, Abeokuta, street and town names). Also remove client and institution names from these captions unless listed in the exceptions below.
- Replace each with a short, accurate description of what the photo shows, in the client's style: "Construction work in progress", "Construction of overhead tank", "Laying of asphalt", "Compaction of sub-base", "Installation of pump".
- Vary them. Don't let a page show the same caption over and over: describe what's actually visible in each photo (the activity, the structure, the stage). Use "Construction work in progress" only when nothing more specific fits, and never for more than two photos on one page.
- Keep these two captions exactly as they are:
  - "Training Ogun State Water Corporation staff on water meter installation"
  - "Strategy session on water meter installation"
- Captions only: project titles keep their names. Update alt text to match the new captions (no place names).

2. BUILDING AND CONSTRUCTION CAPTIONS
- Keep one or two captions that name the COLPLANT building (or the property shown), choosing the strongest photos.
- Caption the rest simply as "Work in progress" or "Completed", choosing whichever is true for the photo. Vary slightly where it reads naturally (e.g. "Work in progress: roofing", "Completed building"), so the page doesn't repeat one phrase all the way down.

3. ADD THE DRILLING PHOTO TO WATER RESOURCES
- From raw-assets/client-photos/_inbox/water-2026-11-08/pictures.docx, take the first or second image: the borehole drilling progress photo with the team in full PPE and helmets. If both qualify, use the one where every person is in a helmet and the rig is clearest.
- Place it in the Water Resources Development and Management category in position 2, 3 or 4 (whichever gives the best variety next to its neighbours). Also add it to the borehole project if the label fits it.
- Caption: "Borehole drilling in progress".

4. CHECK
- List every caption changed (old → new) in docs/caption-changes.md.
- Search all published captions and alt text for place names and confirm none remain apart from the two exceptions and the COLPLANT ones.
- Same rules as before: no dates, no "Nigeria", metadata stripped, one photo in one place.

Report with screenshots of the three category pages and one project page from each (desktop and mobile), plus the caption change list.

---

## What was done

**The rule now.** A photograph caption describes what the photograph shows: the activity, the structure, the stage. It names no place, client or institution. There are four exceptions, all deliberate: the two water-meter captions the brief quotes, and the two COLPLANT captions in Building & Construction. Project titles, the project list under each gallery (client · place) and the narratives keep their names: the brief is about captions only. This replaces the caption rule in `mirror-old-site-content.md` (old caption, cleaned only of case, typos, country and former name). That file still governs which photograph goes where.

Every caption was written from the photograph itself. Each category was rendered as numbered contact sheets and every frame was looked at, so a caption says what is in that frame and not what its neighbours show. 117 captions and 127 alt texts changed; the list, before and after, in gallery order, opens `docs/caption-changes.md`. It is generated from `scripts/caption-brief.json`, the record written when the brief was applied.

### Water Resources, and Civil Engineering & Road

- **The client's construction words.** "Construction of …", "Laying of …", "Installation of …", "Excavation of …", "Compaction of …", plus a stage where the frame shows one ("in progress", "Completed").
- **No caption repeats on any category page.** Four photographs had been "Laying of ductile iron pipe" in one form or another. They are now *Lowering of ductile iron pipe into trench* (the crane is in frame), *Jointing of ductile iron pipe in the trench*, *Laying of ductile iron pipeline along the road* and *Positioning of ductile iron pipe for laying*. The eight river photographs that were "Ongoing work in progress at Sagamu" / "Work in progress at Omi River" each say what that excavator is doing: desilting, removal of silt, clearing vegetation, cutting back the bank, widening the channel.
- **"Construction work in progress" is used nowhere.** Every frame had something more specific in it. The brief allows two per page.
- **The two exceptions** are in the brief's own wording: "Training Ogun State Water Corporation staff on water meter installation" (was "Training of Ogun State Water Corporation Staff on …") and "Strategy session on water meter installation" (was title case). The brief quotes them that way and calls them unchanged, so the quoted text is what is published.
- **Abbreviations spelt out where the old caption leaned on the place.** "COT (Fiditi Dam)" was the only thing telling a reader that "COT" meant a dam's cut-off trench; with the dam's name gone, the captions say "cut-off trench" in words.
- **Unchanged in Civil:** eight captions already named no place ("Priming of MC1 prior to laying of asphalt", "Laying of stone base in progress" and six others). They stay as they were.

### Building & Construction

- **Two COLPLANT captions are kept, unchanged:** the old site's own lead photograph, "Work in progress (completion stage) at College of Plant Science and Crop Production (COLPLANT) Building Phase II for Federal University of Agriculture, Abeokuta.", first on the page; and the strongest photograph in the category, the courtyard, "College of Plant Science and Crop Production (COLPLANT) Building Phase II, Federal University of Agriculture, Abeokuta", fifth. Two are allowed, and they are the two that place the page's first row and a half.
- **Everything else is "Work in progress: …" or "Completed …".** Each has a short tail from the frame ("Work in progress: corridor finishes", "Completed blocks of shops"), so no two of the 32 read the same.
- **Status follows the record, not the look of the building.** Block B and COLPLANT look finished in the photographs he emailed, but both project narratives still say "currently constructing (at completion stage)". Calling them "Completed" would put a handover the record doesn't show on the same page as a sentence denying it. So they read "Work in progress: nearing completion", "… completion stage", "… external works" and so on. If both are handed over, the narratives and those captions change together (open items).
- **"Completed"** is used where the photograph or the record shows it: the UNILAG building (furnished, murals up), the Owode Yewa shops, Horizon Suites (trading), Alabi-Olorunda (the old site's own "completed"), the Ilaro classroom block, the Iperu area office and the Sato office.

### Alt text

Alt text follows its caption and adds what a screen-reader user can't see ("Pipe fitters joining two ductile iron pipes with a coupling"). No alt text names a place, client or institution except the COLPLANT pair and the water-meter training photograph. The sweep went past the three galleries: every service header, the category spotlights, the About photograph, the Clients, Infrastructure, Projects and Services headers, and `site.json`'s unrendered `heroImages` (fixed so they can't bring a place name back if they are ever used). The Block B and COLPLANT alt texts give no storey count. Block B's title says "2 Storey" and its frames show three floors of windows, and the COLPLANT project's old-site photographs show two floors where the emailed courtyard shows three. A count in either would contradict something on the same page.

### The drilling photograph

- **Image 2 of the document (N012).** Image 1 (N001) is the rig and its compressor with no one working. Image 2 is drilling in progress, five people, every one of them in a helmet, the rig's mast and head clear. It is the published file that was already cropped in October: the vest printed with the former name is cut off on the right.
- **It was already on the site**, as the only photograph in the Electrical & Mechanical *service* gallery, captioned "Drilling work in progress at Laderin Estate, Abeokuta by Sato". It moved: one photograph, one place, and a photograph on a project is never also in a service gallery. **The Electrical & Mechanical service page now has no gallery** (the section hides when empty). Its header photograph is unchanged.
- **On the borehole project.** The label is borehole drilling in Abeokuta. *Construction of Solar Powered Boreholes* is the site's one borehole project, in the same state, and its narrative is exactly this photograph: "drilled and commissioned … for … private individuals. Using our state of the art drilling equipment and efficient personnel." The label doesn't say the borehole is solar-powered; drilling is the same either way. It is the project's first photograph, ahead of the completed boreholes, because drilling comes first. Flagged for the client in open items.
- **Third in the Water Resources gallery.** A category gallery runs in `projects.json` order, which put the borehole project's photographs 44th–48th. `ImageRef` gained an optional **`galleryPosition`** (counted from 1), honoured by `getCategoryPhotos()` and ignored on the project page. Third gives the most variety: the first row on a desktop reads inspection party, pump building, drilling crew, and the second opens with a pipe trench, so no two neighbours show the same kind of thing. (It was chosen when the second pump-house exterior was still third; that photograph came off the same day, below, and third is still the best place.)
- **File.** It moved from `services/mechanical-engineering/borehole-drilling-crew` to `projects/solar-powered-boreholes/borehole-drilling` (the selection entry's `out`), re-encoded byte-identical; the old files are deleted. `npm run images` re-encoded all 236 selection outputs because the selection file changed; none differs from the committed file.

### The audit and the plan

`scripts/content-mirror-plan.json` holds the caption the audit checks each photograph against. It now holds the new captions, and where the old site's text had been stored only in `caption` (22 entries, old captions already in mixed case), it moved to `original`, so the "Old site, exactly as written" column still shows the old site. `docs/caption-changes.md` opens with this round's list. Its older tables mark each caption the brief replaced. The audit is at 0 changed captions, 0 duplicates, 0 wrong projects.

### The second pump-house photograph, taken off the same day

While this was being done, another session took `high-lift-pump-building.webp` off the Ogere project on the client's word (launch-ready.md, "9 November, client"): the Water gallery's second and third photographs carried the same caption. This round had re-captioned it "Completed high lift pump house", which also ended the repeat, but the client's instruction was to take it off, so the removal stands. It is not on the site and not in the change list. The mirror plan now marks the old site's copy (`2012/07/71.jpg`) `excluded` on the client's instruction, so the audit reports it with its reason rather than as an unexplained missing photograph ("Missing photo" is 2: this one and the tap-stand children). If it returns, its caption is ready in the plan's `why`.

### Checks

- `npm run build:prod`: placeholders, image metadata (326 files, no EXIF, GPS, XMP or IPTC), build, banned terms, dates (47 project pages, 17 others), redirects (131).
- **Place names:** every `alt` and `figcaption` in the exported HTML (275 distinct strings) was matched against the place, client and institution names on the site and in the old site's captions. Only the COLPLANT pair (caption and alt) and the water-meter training caption and alt remain. A second pass listed every capitalised word in the middle of a caption or alt text; the only ones are those, "UPVC", "MC1" and the company's own name in the logo's alt text.
- **No caption repeats** on any of the three category pages.
