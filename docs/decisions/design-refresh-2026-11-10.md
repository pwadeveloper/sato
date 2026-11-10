# Design refresh — 10 November 2026

**Status:** implemented on the `NewDesign` branch, for the client's review.
Wins over `docs/design-plan.md` wherever the two disagree on presentation.
Changes nothing the earlier decision records settled about *content*: every
word, photograph, caption, attribution line and hidden page is where those
records put it.

## The brief

Build the site to the standard of the award sites the client sent as
references — a logistics platform with a dithered skyline, a halftone pump
jack on yellow, a dot-matrix bust, a blueprint of the Colosseum with one
section drawn in blue, a dark poster with an ASCII moth — using Motion,
WebGL and Three.js. Make Home longer and more convincing by pulling the
site's own material together. Carry one visual system across every page.
Present the project photographs excellently.

What the references share is not a style but a *treatment*: real
photographs and drawings put through a print process (dither, halftone,
dot grid), labelled in a monospace like a technical sheet, with one hue and
a great deal of room. That is an engineering vernacular, not a start-up one,
and it is what the refresh builds on.

## The idea: the drawing and the built thing

Everything Sato builds starts as a drawing — a survey, a section, a schedule
of quantities — and becomes concrete, asphalt and water. The site plays that
transition everywhere:

- **Photographs develop from a field of dots** as they arrive (`DevelopImage`,
  the halftone develop in `globals.css`). On the home hero the same idea is
  a WebGL ordered-dither shader (`DitherCanvas`): the photograph begins as a
  two-tone print in the brand green on the page colour and resolves grain by
  grain into the picture; afterwards the pointer lifts the drawing back out
  of the print under it. The photographs themselves are never altered — the
  drawing state is a transition, and the resting state is always the whole
  photograph, because a verifying reader has come to see the work.
- **A live survey model** (`SurveyField`, Three.js) sits behind the motto:
  a field of points on rolling ground with contour lines, in the brand green
  on asphalt, that breathes slowly and rises under the pointer like a
  levelling probe. It is the one generative element on the site.
- **The drawing layer is a monospace.** IBM Plex Mono carries every label:
  eyebrows, running indices (`01`, `02`), the nav, buttons, captions'
  numbers, the data plate, breadcrumbs. Archivo is unchanged for display and
  body — the client's heavy headings stay heavy.
- **A survey grid** of dots sits under the hero, the page headers, the dark
  bands and the dropdown panels; **a scale bar** of ticks marks the edge of
  every photograph band and the footer, in the band's own colour.
- **Everything is indexed.** Lists, galleries, sections, nav groups: a
  running number in the mono, so a reader scanning for the third of five
  knows there are five.

The palette is untouched. One addition, `paper` (`#F4F2EE`), is the card
and alternate-band surface between concrete and white; every text colour
verified on concrete clears it with more margin.

## Motion, and where it is not

- **Reveals are CSS**, scrubbed by the element's own entry into the viewport
  where the browser supports scroll-driven animations, played once on load
  elsewhere. Nothing is hidden by an inline style waiting for JavaScript: a
  crawler, a print stylesheet or a reader with scripts off gets every page
  whole. Headings rise a word at a time on the same principle (`SplitText`).
- **Motion (the library)** is used only where JavaScript already has to be:
  the dropdown and phone nav panels, the picture that follows the pointer
  down the "What we do" index, the counters on the data plate. It is loaded
  as `LazyMotion` with the `domAnimation` features, `strict`, so the full
  build cannot creep in.
- **Three.js** is loaded after hydration, only on Home, only when its band
  is on screen, and never on the server. Both pieces pause offscreen and
  when the tab is hidden, cap device pixel ratio, draw in one call, dispose
  on unmount, and do nothing under `prefers-reduced-motion` or without
  WebGL. The chunk is the cost of the brief, and it is paid once, lazily,
  after the page is usable.
- **Route changes crossfade**, and a photograph carries across the page it
  was opened from — a category's spotlight from its tile (on Home or on
  /projects) into its page header, a project's lead photograph from the
  category gallery into its page — through React's `ViewTransition`. A
  browser without the API swaps pages as before.
- **No smooth-scroll library, no custom cursor, no scroll hijacking.** The
  client's readers are procurement officers on whatever machine they have.
- `prefers-reduced-motion` turns all of it off: reveals, develops, word
  rises, the marquee, the view transitions, the shaders.

## Home

The welcome and the motto are the client's own words and still open and
anchor the page. What follows is the site's own material brought onto one
page rather than written again; the copy for each section is in
`pages/home.json` and is headings and one-line intros only, no new claims:

1. **Hero** — tagline eyebrow, the verbatim title and first paragraph, two
   buttons, the photograph developing from the drawing.
2. The second welcome paragraph and a link to About.
3. **Motto** over the survey field.
4. **What we do** — the five service categories from `getServiceBands()`,
   as an index whose picture follows the pointer; Infrastructure's four
   disciplines inside its row. Energy, Digital Twin and Research have no
   photograph yet and show their name set large on the grid instead.
5. **Projects** — one door per *published* category from
   `getProjectCategories()`: its spotlight photograph, its line, its count.
6. **Company at a glance** — `getCompanyFacts()` as a plate; the years in
   operation and the founding year count up.
7. **Clients** — Sato's own clients' names (never the partner's), as a
   marquee that pauses on hover and becomes a list under reduced motion.
8. Mission and vision, as a pair, only under `homeShowMissionVision`.
9. A closing band — existing approved copy from the services page.

### The one photograph rule, and Home

A category's spotlight is "a photograph of a project in that category" and
may be "one category tile or one page header" as well as on its project.
Home now shows it a third time, as the category's door. The reading taken
here is that the spotlight is the category's *identity* picture — the same
one wherever the category is listed — which is also what the morph between
the door and the page header says to the reader. `scripts/audit-site-content.mjs`
records it as the one `tile` place it already was. **Flagged for the client
in `docs/open-items.md`**: if he would rather Home not repeat the tiles, the
doors can take project photographs that are not spotlights, or no
photographs.

## Project presentation

- Category pages keep the client's format — every photograph in one
  gallery, caption in small plain text beneath, no titles over the pictures
  — with each figure indexed, developing as it scrolls in, growing slightly
  under the pointer, and the project's lead photograph morphing into its
  page.
- Project pages open any photograph larger: a native `<dialog>` lightbox
  (`components/Lightbox.tsx`) with the captions, previous/next, arrow keys,
  swipe, focus returned to the picture that opened it. The Electrical &
  Mechanical service gallery opens the same way. Its five labels are in the
  projects and services page JSON.
- The Oil & Gas table, attribution line and case study are unchanged.

## Everything else

The header is still one solid bar; the footer still one band under 120px;
dropdowns still open on click; no hardcoded copy; one `h1` per page; one
heading scale through `Heading`; the banned-terms, dates, placeholders,
images and redirects checks all pass on `npm run build:prod`.

## Pending

- The client's view of the Home doors (above), the survey field, and the
  dither on the hero — any of the three is one component removed.
- Energy, Digital Twin and Research photographs, which would complete the
  "What we do" index and let their project categories publish.
