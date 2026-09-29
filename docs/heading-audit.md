# Heading audit — service pages

**Why this exists.** On the review call the client picked out that section
headings on the service pages did not share a style: the pyramid's "From
surveillance to transformation", "Technology solutions" and the equipment
sourcing heading were all subsections of Solutions and all three looked
different from each other. They did, and the reason was that each block
carried its own heading markup and its own Tailwind classes.

This file is the before-and-after for every heading a service page emits, and
the scale they all now use.

---

## The scale

| Level | What it is | Size token | Weight |
|---|---|---|---|
| `h1` | The page title | `text-h1` (33 → 65px) | 900 |
| `h2` | The three template sections: Capabilities, Solutions, Partnerships | `text-h2` (26 → 52px) | 800 |
| `h3` | Every subsection inside one of them | `text-h3` (21 → 26px) | 700 |
| `h4` | A group inside an `h3` | `text-lg` (21px) | 700 |

All of it is `wdth-heading` (Archivo `wdth` 112) and `text-balance`, and all of
it goes through `components/Heading.tsx`. **No service page sets a heading
class of its own.** A heading level is also its size: `<Heading level={3}>`
renders `h3` at `h3` size, and the `size` override exists only so a visually
large heading never has to become a second `h1`.

`h4` moved from `text-xl` to `text-lg`. At the desktop end `text-xl` and
`text-h3` are both 1.625rem, so an `h4` set at `text-xl` was the same size as
the `h3` above it — the hierarchy existed in the markup and not on the page.

Sentence case throughout, with proper nouns and acronyms keeping their
capitals. The service names are the one thing still set as written — "Civil
Engineering & Construction", "Oil & Gas Services" — because they are names,
used identically in the nav, the breadcrumbs, the sitemap and the redirects,
and changing them here would mean changing them everywhere.

Three page-level bands sit **outside** the three sections and keep their own
`h2`: "Backed by Sato", "Related services" is now inside Partnerships as an
`h3`, and the CTA band. They are page furniture rather than content sections,
and they read as `h2` in the outline because that is what they are.

---

## Before → after

### Every service page (`/services/[slug]`)

| Heading | Before | After |
|---|---|---|
| Page title | `h1` `text-h1` | unchanged |
| "Capabilities" | `h2` on Oil & Gas at `text-h2`; on the other seven an `h2` in the sidebar at `text-2xs` uppercase eyebrow | `h2` `text-h2`, on all eight |
| "Solutions" | `h2` `text-h2` on Oil & Gas; absent elsewhere | `h2` `text-h2`, on all eight |
| "Partnerships" | `h2` `text-h2` on Oil & Gas; absent elsewhere | `h2` `text-h2` where the section has content |
| A capability area ("Artificial intelligence, digitalization…") | `h3` `text-xl font-bold` (`CapabilityBlocks`) | `h3` `text-h3` (`ServiceSectionGroups`) |
| A solution area ("Roads and pavements", "Planning, design and feasibility") | did not exist | `h3` `text-h3` |
| "Technology solutions" | `h3` `text-xl font-bold` | `h3` `text-h3` |
| "Subsurface and seismic", "Field development and reservoir management", "Production and facilities" | `h4` `text-2xs` uppercase eyebrow | `h4` `text-lg` |
| "From surveillance to transformation" | `h3` `text-xl font-bold` | `h3` `text-h3` |
| Pyramid tiers — "Surveillance", "Analysis", "Optimization", "Transformation" | `h4` `text-2xs` uppercase eyebrow, swatch inside the heading | `h4` `text-lg`, swatch beside it |
| "Where the value comes from" | `h3` `text-xl font-bold` | `h3` `text-h3` |
| "Equipment sourcing and procurement" | `h3` `text-xl font-bold` | `h3` `text-h3` |
| Equipment categories — "Pumps", "Metering and flow", "Valves and actuation", "Instrumentation", "Process control and automation", "Compression and safety", "Mechanical components" | **not headings at all** — `<dt>` at `text-base font-bold` inside a `<dl>` | `h4` `text-lg` inside a `<section>`. Heading content is not allowed inside a `<dt>`, so the `<dl>` had to go for these to be real headings. |
| "Also covered" | `h3` `text-xl font-bold` | `h3` `text-h3` |
| "Registrations and permits" (never rendered — no service declares any) | `h3` `text-2xs` uppercase eyebrow | unchanged |
| "Work delivered" (the client-photo gallery; empty on every service today) | `h2` `text-h3` | `h3` `text-h3` |
| "Related services" | `h2` `text-2xs` uppercase eyebrow — **an `h2` nested inside the Partnerships `h2` section** | `h3` `text-h3`, inside Partnerships where it belongs |
| A related service's name | `h3` `text-base font-bold` | `h4` `text-base font-bold` |
| "Backed by Sato" | `h2` `text-h2` (and absent from Oil & Gas) | unchanged, now on Oil & Gas too |
| "Projects" / "Clients" inside that strip | `h3` `text-xl font-bold` | unchanged |
| CTA band heading | `h2` | unchanged |

### The Infrastructure Services landing page (`/services/infrastructure`)

| Heading | Before | After |
|---|---|---|
| "Infrastructure Services" | `h1` `text-h1` | unchanged |
| — | no section headings at all | `h2` "Capabilities", `h2` "Solutions", both `text-h2` |
| Each discipline — "Civil Engineering & Construction" etc. | `h2` `text-h3` | `h3` `text-h3`, inside Capabilities |
| "Selected capabilities" (one per discipline) | `h3` `text-2xs` uppercase eyebrow | removed — the page no longer previews five bullets per discipline, it describes the type in two or three sentences |
| The six solution areas | did not exist | `h3` `text-h3` |

### Removed

- `components/CapabilityBlocks.tsx` — its numbered, brand-ruled treatment is
  now `components/ServiceSectionGroups.tsx`, which every `h3` subsection uses.
- `components/ServiceGroupList.tsx` — already dead before this round (nothing
  had imported it since the Home divisions strip changed), and removed here
  rather than left to be mistaken for the new component.
- The `headingLevel === 2 ? "text-h3…" : "text-xl font-bold…"` ternary that
  appeared, copied, in `ServiceListBlock`, `ProcurementList`, `ValueMap`,
  `SolutionsPyramid` and `ServiceGallery`. That one duplicated expression was
  the whole inconsistency: an `h3` was `text-h3` when it was a section heading
  and `text-xl` when it was a subsection, and different blocks disagreed about
  which they were.

---

## How to check it stayed true

```
npm run build
grep -oE '<h[1-4][^>]*>' out/services/oil-gas.html
```

Every service page's outline should read `h1`, then `h2` per section, then
`h3` per subsection, then `h4` per group, with no level skipped and no `h2`
inside a section.
