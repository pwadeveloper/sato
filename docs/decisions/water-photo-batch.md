New client photos: a labelled Word document at raw-assets/client-photos/_inbox/water-2026-11-08/pictures.docx (17 pages, mostly water projects). Extract and use it as follows. Work on the same branch; commit and push for a new preview.

1. Extract every image from the .docx with the label/caption text next to it (as in prompt 16: word/media plus document.xml and its rels). The labels are the source of truth for which project each photo shows. Skip any image already used on the site (perceptual hash).

2. Spotlight (category hero) images:
   - Building and Construction: use the Academic Building Complex Block B, Federal University of Agriculture, Abeokuta. Use the best existing photo of that building, or one from this document if it's better.
   - Water Resources Development and Management: replace the current spotlight with the strongest labelled water photo from this document.
   - Civil Engineering and Road: keep the current image. More road photos are coming later.
   - Electrical and Mechanical: keep the current image.
   A photo used as a spotlight must come from a project in that category, and must not be used as another category's spotlight.

3. Add the remaining labelled photos to the projects their labels name, with the label as the caption underneath (cleaned up as in prompt 17: sentence case, no "Nigeria" or former name, no dates). If a label names a project that isn't on the site, or a photo has no clear label, leave it out and list it.

4. Same rules as before: strip all metadata and verify it, no unsafe site practice, no burned-in dates, one photo in one place.

Report with screenshots of all four category spotlights and two updated water project pages (desktop and mobile), plus the list of photos you couldn't place.

---

## What was done

### The document

17 pages, 29 images: 28 photographs and one EMF. Extracted with
`node scripts/extract-client-photos.mjs water-2026-11-08` into
`raw-assets/client-photos/_work/water-2026-11-08/`, IDs N001–N028. The script
gained a batch argument for this: run over the whole inbox it would have
renumbered the October set, whose W-numbered files
`client-photo-selection.json` points at, and both documents are called
`Pictures.docx`.

**Labels were read from the page geometry, not the text order.** Every label
and every photograph is an absolutely positioned VML shape. On every page a
photograph's label is the text box directly beneath it. Read in text order,
three labels come out against the wrong photograph, which is what October's
caption guess did: image 7 is the high lift pump installation, not "casting of
concrete support"; images 15 and 16 are both "Construction of ground tank",
naming no site. Page 17's label is not text at all: it is an EMF strip
beneath the photograph whose text records read "Asphaltic concrete road under
construction at Life University Ajebo, Ogun State".

Five text boxes sit **behind** a photograph (a lower z-index, inside its
frame), so they don't show on the page: "Repair works on sand filter now
completed at Arakanga water scheme" (page 2), "Ductile iron pipes being
offloaded at Ogere water supply scheme by our crane lorry" (page 11), and on
page 13 "Ongoing work in progress at Sagamu", "Construction of ramp access to
1st segment of cut-off trench excavation (Fiditi dam)" and "Picture showing
complete segments 1 & 2 of Fiditi's dam cut-off trench excavation". The
photographs over them show dozing pumps, a pump house and a road, so they are
leftovers from an earlier layout and were not used.

### Every photograph was already in the October document

`node scripts/compare-photo-batch.mjs <batch> --against=raw-assets/client-photos/_work/all --against=raw-assets/old-site`
(`--against` is new: a published file is often an off-centre crop, and a
photograph dropped on the helmet rule is on no page at all). All 28 are pHash
0 against an October working copy. So nothing here is a new photograph. What
could be new is a label, and one was.

Outcomes as they stand after the client's instruction of 9 November (below).

| N | Page | Label (cleaned) | October | Outcome |
|---|---|---|---|---|
| N001 | 1 | The drilling rig and Ingersoll Rand compressor 825cfm model | W054 | **Water category gallery** (no project in its label); right 22% cropped off, the compressor's decal carries the former name |
| N012 | 1 | Drilling work in progress at Laderin Estate, Abeokuta | W056 | Skipped: already on the site (Electrical & Mechanical gallery) |
| N023 | 2 | Installation of alum dozing pumps at Ogere water supply scheme | W071 | **Ogere project** |
| N022 | 2 | Installation of lime dozing pumps at Ogere water supply scheme | W070 | **Ogere project**; cropped to the pumps, the vest carries the former name |
| N025 | 3 | Casting of concrete support for pipe bend at Ogere | W073 | **Ogere project**, at 800px only: the vest's small print carries the former name |
| N024 | 3 | Connection of ductile iron pipe at Ogere | W072 | **Ogere project** |
| N026 | 4 | Installation of high lift pump in progress at Ogere | W074 | **Ogere project**; left 27% cropped off, a vest carries the former name |
| N027 | 5 | Excavation of trench for pipe laying in progress at Ogere | W076 | **Ogere project** |
| N028 | 5 | Connection of 300mm pipe to 150mm pipe at Oshitelu junction, Ogere | W078 | **Ogere project** |
| N002 | 6 | Laying of ductile iron pipes in progress at Ogere | W079 | **Ogere project** |
| N004 | 7 | Laying of ductile iron pipe at Ogere | W083 | **Ogere project**, at 800px only: two vests' small print carries the former name |
| N003 | 7 | Laying of ductile iron pipe in progress at Ogere | W082 | **Ogere project** |
| N006 | 8 | Construction work in progress at Ogere water scheme | W086 | Skipped: already on the site (`ogere-1`, Ogere project) |
| N005 | 8 | Construction work in progress at Ogere water scheme | W085 | **Ogere project** |
| N007 | 9 | Construction of ground tank | W087 | **Ogere project** (site confirmed 9 November) |
| N008 | 9 | Construction of ground tank | W089 | **Placed** on the Ogere project, and the Water spotlight, once the client confirmed the site (9 November) |
| N010 | 10 | Construction of clear water tank in progress at the Ogere water supply scheme | W091 | **Ogere project** |
| N009 | 10 | Construction of clear water tank in progress at the Ogere water supply scheme | W090 | **Ogere project** |
| N013 | 11 | Ongoing works at Ogere water supply scheme | W093 | **Ogere project** |
| N011 | 11 | Ongoing works at Ogere water supply scheme | W092 | **Ogere project**; bottom 52% cropped off, two vests carry the former name |
| N015 | 13 | Priming of MC1 prior to laying of asphalt | W007 | **Civil category gallery**; the burned-in caption strip cropped off |
| N014 | 13 | Laying of asphalt in progress | W006 | **Civil category gallery** |
| N017 | 14 | Laying of stone base in progress | W009 | **Civil category gallery**; the burned-in band naming Yaba–Iddo cropped off |
| N016 | 14 | Compaction of sub-base material in progress | W008 | Skipped: already on the site (Civil category photos) |
| N019 | 15 | Laying of asphalt in progress | W011 | **Civil category gallery** |
| N018 | 15 | Asphalt being compacted | W010 | **Civil category gallery** |
| N020 | 16 | Construction of road | W014 | **Civil category gallery** |
| N021 | 17 | Asphaltic concrete road under construction at Life University Ajebo, Ogun State | W020 | **Placed** on the Life University road project |

None of the 28 carries a burned-in date. N015, N016 and N017 carry burned-in
caption text, which is a reason to crop or leave out, not a date.

### What changed on the site

- **N021 → Asphaltic Concrete Road & Drainage System (Life University,
  Ajebo).** October held it because its caption then named no place. This
  document's label names Life University Ajebo. It is the project's fourth
  photograph, after the old site's three, captioned with the label. It is
  published at 1920px with no crop. **Safety, judged on the October
  precedent:** the roller operator is under the canopy (allowed), and one
  figure at the gatehouse in the far background has no helmet when zoomed to
  full resolution. At display size that figure is about 15–20px tall and can't be
  judged, which is how `fce-osiele-4` was kept in October. Remove it if that
  precedent shouldn't stretch this far.
- **Building & Construction spotlight → Academic Building Complex Block B**
  (`building-front`, the resent email's `068d09d3…`), in place of the Horizon
  Suites entrance. The document has no FUNAAB photograph, so this is the best
  existing one: the red-and-white tower, no one on site. It is the 1080px copy
  from the email, so it is soft at full width on a desktop. The camera
  original would fix that (listed in open items). The building fills the top
  of the frame, so a centred 16:6 crop would take the tower off. `ImageRef`
  gained an optional **`focalPoint`** (a CSS `object-position`), applied by
  `PageHeader` and the Projects tile. Block B's is `40% 0%`.
- **Water Resources spotlight: unchanged.** Every photograph labelled with a
  water project shows people on site without helmets, except N006, which is
  already on the Ogere project and is a rebar mat, weaker than the current
  completed pump house. The strongest water photograph, N008, names no site.
  The brief's rules (a spotlight comes from a project in its category, labels
  are the source of truth) leave nothing to replace it with. It is the first
  question in `docs/open-items.md`.
- **Civil and Electrical & Mechanical: unchanged, as instructed.** Note the
  Electrical & Mechanical spotlight (the Iperu booster station breaker panel)
  is on no project. It predates the rule in this brief and is kept because the
  brief says to keep it. The Sagamu pump panel is the photograph on an
  Electrical & Mechanical project, if he wants the rule applied there too.

The four spotlights are four different photographs, each from its own
category. The content audit shows no duplicate and no wrong project.

### Settled after the report (9 November)

**The ground tank is at Ogere** (client). N008 is now on the Ogere project,
its sixth photograph, captioned with its label cleaned: "Construction of
ground tank by Sato". It is also the **Water Resources spotlight**, replacing
the completed high lift pump house, which stays on the project. Its
`focalPoint` is `50% 75%`, so the 16:6 band keeps the tank's rim and the
water rather than the roofs behind. It is published at 1600px, its original
size, with no crop. No one is in frame, and it shows no text and no date. N007, the other
ground-tank photograph, stays off: it shows people on site without helmets.

### The client's instruction (9 November): use every photograph

> I requested the most recent pictures in the word document for water and
> road projects uploaded. The first pages are water related and the final
> pages are road. Also I suggested changing the pictures highlighted for
> building and water projects.

Relayed with: "ignore the helmet issues and use the most recent images in the
document." **The helmet rule is waived for this document's photographs, on the
client's instruction. It is not waived for anything else**: the old-site and
October photographs still held on it stay off unless he says otherwise.

What still applies, because neither instruction touched it: labels decide the
project, one photograph is in one place, and no legible former name, country,
number plate or burned-in caption is published.

- **16 more on the Ogere project** (22 photographs in all), in the document's
  page order after its existing six. Every label on pages 2–11 names Ogere.
- **Seven with no project in their label go to their category's own
  gallery**, the place CLAUDE.md gives a captioned photograph tied to no
  project: the drilling rig (page 1) under Water Resources, and the six road
  photographs (pages 13–16) under Civil Engineering & Road Construction. The
  old site shows its copies of three of those road photographs the same way,
  on its roads page with no project.
- **The former name.** On N022, N026 and N011 it is printed large on a vest,
  so it is cropped out and the subject survives each crop. On N025 and N004
  it is small print that no crop clears without losing the subject. Those two
  are published at 800px only (October's second ruling, never used until now;
  `maxWidth` in the selection entry), where it can't be read. N001's decal is
  cropped as October cropped it. "SATO" alone (N013, N023, N024's frame edge)
  is the current name and stays.
- **Burned-in text** is cropped off N015 (caption strip) and N017 (project
  band). No photograph shows a legible number plate or a date.
- **Captions** are the labels, cleaned: sentence case, "by Sato" for the
  former name, "Ingersoll Road" → "Ingersoll Rand", "dozing" → "dosing",
  "highlift" → "high lift", "been compacted" → "being compacted". "Iron
  ductile pipe" is left as written.
- **Old site.** Eight of these are the old site's own photographs, which the
  mirror plan had excluded on the helmet rule. They now sit where the old site
  puts them, with its captions cleaned, so the audit's "Missing photo" count
  falls from 36 to 28.

**Burned-in dates found on the way.** Two water-meter photographs already in
the Water Resources gallery (the old site's 2019 training set, not this
document) carried the camera's date stamp, "11/OCT/2013", in the corner. The
text date check can't see inside a picture. Both now have the bottom 13% cut
off, which takes the stamp and nothing else. The training photograph moved
from `image-map.json`, which cannot crop, to the selection file, under the
same output name.

`check:images`: 246 published images, no EXIF, GPS, XMP or IPTC.

### Pipeline repairs found on the way

- **The email photographs were not in `client-photo-selection.json`.** The
  five FUNAAB photographs placed on 8 November had been encoded by hand and
  written into the manifest by hand. `npm run images` rewrites the manifest
  from the selection file, so its next run would have dropped those records,
  the only trace of their original filenames, and reported the files as
  orphans. They are now selection entries (`working` E-…, `source` the inbox
  file, which is upright and 1080px), with their `placement` note carried into
  the manifest. Re-encoded, all 106 selection outputs are byte-identical to
  the committed files.
- **The content audit crashed** on those manifest records (no `workingId`).
  It now falls back to the filename, and `content-mirror-plan.json` records a
  decision for each email photograph and for W020, with an optional `from`
  naming the batch it came from.
- **Not fixed: `services/civil-engineering-road/campus-road-and-buildings-header`**
  is the live Civil service header, also made by hand (in the
  four-categories round) with no source entry. `npm run images` lists it as an
  orphan "to delete by hand if stale". It isn't stale, so don't delete it.
  Recording its source and crop in the selection file would close this.

### Metadata

N021's original carries EXIF (Sony DSC-S2000, date taken; no GPS). Both
published files (`tandem-roller.webp` 1920×1440, `-800` 800×600) carry no
EXIF, XMP, IPTC or ICC block. `npm run check:images` (part of `build:prod`):
198 published images, no EXIF, GPS, XMP or IPTC.
