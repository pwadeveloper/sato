# Design plan — Sato Engineering and Infrastructure

Provisional design system for the rebuild. Written before implementation, then
reviewed against the brief (see "Review" at the end, which records what changed).

**Who this is for.** An oil and gas procurement or contracts officer who has
received a letter from Sato and is checking whether the company is real,
established, capable and safe to work with. Secondary: government and
institutional client staff. The site must feel established, serious and current,
rooted in Nigerian infrastructure work — not a template, not a startup.

**Subject vernacular.** Site work: laterite earth, asphalt, poured concrete,
steel, hi-vis safety yellow, survey pegs. Source of colour and texture. No
blueprint grids, no drafting-paper motifs.

---

## 1. Palette

The logo arrived during this phase and the palette is reconciled against it.
The logo is a green lozenge (two tones, split horizontally) with the wordmark
"Sato" in white, and "ENGINEERING & INFRASTRUCTURE LIMITED" alongside.

Sampled from `logo/Black.png`: `#177B0B` (upper) and `#2E7229` (lower).

**Decision:** Sato green becomes the primary accent (links, primary buttons,
active states). Laterite is retained as the secondary, warm accent (section
rules, sector tags, hover) because it carries the site-work vernacular the brief
asked for and pairs naturally with the green. Asphalt, concrete, steel and
survey yellow are unchanged from the brief.

### Tokens

| Token | Hex | Role |
|---|---|---|
| `--color-green` | `#177B0B` | Brand green. Primary button fill, active rules. |
| `--color-green-deep` | `#2E7229` | Logo's lower tone. Dark green band, pressed state. |
| `--color-green-ink` | `#136509` | Link and accent **text** on light surfaces. |
| `--color-green-light` | `#80B076` | Link and accent text on dark surfaces. |
| `--color-asphalt` | `#22272B` | Primary text; dark sections; the data plate. |
| `--color-asphalt-raised` | `#2E3236` | Card surface inside dark sections. |
| `--color-concrete` | `#E9E6E1` | Page background. |
| `--color-white` | `#FFFFFF` | Content surfaces, cards on concrete. |
| `--color-steel` | `#5A6A73` | Borders, muted UI, rivets. |
| `--color-steel-ink` | `#4E5C64` | Secondary **text** on light surfaces. |
| `--color-steel-light` | `#9AA2A4` | Secondary text on dark surfaces. |
| `--color-rule` | `#CACBC9` | Hairline rules on light. |
| `--color-rule-dark` | `#3E4244` | Hairline rules on dark. |
| `--color-laterite` | `#8F3F1E` | Secondary accent. Section rules, sector tags, hover. |
| `--color-survey` | `#E2B236` | Sparing highlight: focus ring, HSE, one hero detail. |

Three text colours are darkened derivatives rather than brief values, because
the brief values do not clear WCAG AA at body size:

- `green-ink` `#136509` — the brand green `#177B0B` gives only **4.36:1** on
  concrete, below the 4.5 floor. Darkened to 82%.
- `steel-ink` `#4E5C64` — `steel #5A6A73` gives **4.50:1** on concrete, passing
  with no margin at all. Darkened for body use; `steel` stays for borders.
- `green-light` / `steel-light` — light variants for text on asphalt, which the
  brief did not specify but the dark sections need.

### Verified contrast (WCAG 2.1)

| Pair | Ratio | Use |
|---|---|---|
| asphalt on concrete | 12.1:1 | Body text | 
| steel-ink on concrete | 5.6:1 | Secondary text |
| green-ink on concrete | 5.8:1 | Links |
| green-ink on white | 7.3:1 | Links on cards |
| laterite on concrete | 5.8:1 | Secondary accent text |
| white on green | 5.4:1 | Primary button |
| white on laterite | 7.3:1 | Secondary button |
| concrete on asphalt | 12.1:1 | Dark section body |
| green-light on asphalt | 6.0:1 | Dark section links |
| steel-light on asphalt | 5.8:1 | Dark section secondary |
| survey on asphalt | 7.7:1 | Highlight, focus on dark |
| asphalt on survey | 7.7:1 | Text on a survey badge |

Survey yellow is **never** text on a light surface: on concrete it is 1.6:1.
It is a fill, a rule, or a focus ring only.

---

## 2. Type

**Archivo** (Google Fonts), variable, `wdth` axis 62–125. One family only.
Loaded through `next/font` and self-hosted, so the static export has no
third-party font request.

Width is the expressive axis, not a second typeface:

| Use | `wdth` | Weight |
|---|---|---|
| Hero display | 118 | 800 |
| Headings h1–h3 | 112 | 700–800 |
| Body, UI | 100 | 400–600 |
| Data plate values | 100 | 500, `tabular-nums` |

### Scale — 1.25 ratio, body 17px

| Step | Size | Line height | Use |
|---|---|---|---|
| `2xs` | 12px | 1.4 | Plate labels, captions |
| `xs` | 13.6px | 1.45 | Meta, sector tags |
| `sm` | 15px | 1.5 | Small body, table cells |
| `base` | **17px** | 1.6 | Body |
| `lg` | 21px | 1.45 | Lead paragraph |
| `xl` | 26px | 1.3 | h4 / h3 |
| `2xl` | 33px | 1.2 | h3 / h2 |
| `3xl` | 41px | 1.1 | h2 |
| `4xl` | 52px | 1.05 | h1 |
| `5xl` | 65px | 1.02 | Hero display |

Display steps are fluid, so 360px never gets a heading it cannot hold:

```
hero  clamp(2.5625rem, 1.976rem + 2.609vw, 4.0625rem)   41px → 65px
h1    clamp(2.0625rem, 1.598rem + 2.065vw, 3.25rem)     33px → 52px
h2    clamp(1.625rem,  1.258rem + 1.630vw, 2.5625rem)   26px → 41px
h3    clamp(1.3125rem, 1.190rem + 0.543vw, 1.625rem)    21px → 26px
```

Tracking: `-0.02em` on hero, `-0.015em` on h1–h2, `0` on body.
Measure: prose capped at **68ch**, comfortably under the 75-character ceiling.
Headings sentence case throughout (CLAUDE.md rule 5).

---

## 3. Space, grid, surface

**Spacing** — 4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.

**Section rhythm** — `clamp(3.5rem, 2rem + 6vw, 7rem)` vertical padding.
56px at 360, 112px at 1280.

**Container** — 1280px max. Gutters 20px / 32px / 48px at 360 / 768 / 1280.

**Grid** — 12 columns on desktop (≥1024px), 24px gutter. 6 columns on tablet.
Single column below 768px. Everything left-aligned; nothing centre-aligned
except the mobile menu's own layout.

**Radius** — `0` on every structural surface: cards, panels, buttons, inputs,
the data plate. The only rounded shape is a **pill tag** (sector labels, status
chips), which deliberately echoes the logo's lozenge. Roundness is a quotation
of the mark, used sparingly, not a default.

**Depth** — no shadows anywhere. Separation is carried by 1px hairline rules
(`--color-rule`, `--color-rule-dark`) and tone shifts between concrete, white
and asphalt. This is the strongest single move away from template UI.

**Motion** — 150ms colour transitions on interactive elements, nothing else.
No scroll-triggered animation. `prefers-reduced-motion: reduce` sets every
duration to near-zero globally.

**Focus** — 3px `survey` outline at 2px offset, with a 2px `asphalt` ring filling
the offset gap so the indicator reads on both concrete and asphalt. Survey alone
on a light background is only 1.6:1 against the page, so the dark inner ring is
doing the accessibility work, and the yellow is doing the brand work.

---

## 4. The one memorable thing — Company at a glance

A **data plate**, the kind riveted to a piece of plant. This is what the
verifying visitor came for.

- Solid asphalt block, square corners, sitting on the concrete page.
- A 3px survey-yellow bar across the top edge. The single hi-vis moment on Home.
- Four steel rivets, inset from the corners, with a 1px light inner edge.
- Rows as a definition list: label in `steel-light`, `2xs`, `wdth` 100;
  value in `concrete`, `tabular-nums`, `500`.
- 1px `rule-dark` hairline between rows. Label column fixed at 13rem on desktop,
  stacked above the value on mobile.
- No heading decoration, no icon, no card shadow. The precision is the point.

Everything else on the page stays quiet so this reads as the anchor.

---

## 5. Wireframes

### Home — desktop (12 col)

```
┌────────────────────────────────────────────────────────────────────┐
│ [SATO logo]            About Services Projects Clients … Contact   │  header, concrete, 1px rule under
├────────────────────────────────────────────────────────────────────┤
│ 1        4        7        10                                      │
│                                                                    │
│ Engineering Nigeria's                                              │  hero display 65px, wdth 118, w=7col
│ infrastructure since 1997.                                         │
│                                                                    │
│ Sato Engineering and Infrastructure Limited is an       [ photo ]  │  lead 21px, w=6col
│ indigenous Nigerian engineering firm…                   [ full-   ]│  image cols 8–12, full-bleed right
│                                                         [ bleed  ] │
│ [ Contact us ]  View our projects                       [        ] │  primary btn + text link
│                                                                    │
├────────────────────────────────────────────────────────────────────┤  asphalt band
│ ▀▀▀ survey bar                                                     │
│  ●                                                              ●  │  rivets
│  COMPANY AT A GLANCE                                               │  h2, concrete, wdth 112
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Registered name    │ Sato Engineering and Infrastructure Ltd │  │  label 13rem │ value tabular
│  ├────────────────────┼─────────────────────────────────────────┤  │
│  │ Formerly           │ Sato Engineering Nigeria Limited        │  │
│  ├────────────────────┼─────────────────────────────────────────┤  │
│  │ Incorporated       │ 1997                                    │  │
│  ├────────────────────┼─────────────────────────────────────────┤  │
│  │ Years in operation │ 29                                      │  │
│  ├────────────────────┼─────────────────────────────────────────┤  │
│  │ RC number          │ {{CONFIRM}}                             │  │
│  ├────────────────────┼─────────────────────────────────────────┤  │
│  │ Head office        │ Abeokuta, Ogun State                    │  │
│  ├────────────────────┼─────────────────────────────────────────┤  │
│  │ Registrations      │ COREN; NSE; NIM; RICS                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ●                                                              ●  │
├────────────────────────────────────────────────────────────────────┤
│ What we do                                                         │  h2
│ ──────────────────────────────────────────────────────────── 1px   │  laterite rule, first 64px only
│ Civil & Infrastructure          Roads, buildings, earthworks,      │  row, not card
│                                 drainage and erosion control.    → │
│ ──────────────────────────────────────────────────────────── rule  │
│ Water Resources                 Earth dams, irrigation, water      │
│                                 supply schemes, boreholes…       → │
│ ──────────────────────────────────────────────────────────── rule  │
│ Electrical & Mechanical         {{CONFIRM}}                       →│
│ ──────────────────────────────────────────────────────────── rule  │
│ {{CONFIRM: energy}}             {{CONFIRM}}                       →│
├────────────────────────────────────────────────────────────────────┤
│ Trusted by                                                         │
│ Federal Ministry of      World Bank            University of       │  3-col typeset register,
│ Water Resources                                Ibadan              │  hairline rules, no fake logos
│ ──────────────────────   ──────────────────    ─────────────────   │
│ UNDP                     Lagos State Public    FUNAAB              │
│                          Works Corporation                         │
├────────────────────────────────────────────────────────────────────┤
│ Selected projects                                                  │
│ ┌──────────────────────────────┐ ┌───────────────┐ ┌─────────────┐ │  asymmetric: 1 wide + 2
│ │ [image]                      │ │ [image]       │ │ [image]     │ │
│ │ (water)                      │ │ (water)       │ │ (buildings) │ │  pill tag, laterite
│ │ Fiditi Earth Dam             │ │ Ogere Water   │ │ COLPLANT    │ │
│ │ Ogun-Osun River Basin Dev.   │ │ Supply Scheme │ │ Phase II    │ │
│ │ 2012 · {{CONFIRM: status}}   │ │ 2012 · Compl. │ │ FUNAAB      │ │
│ └──────────────────────────────┘ └───────────────┘ └─────────────┘ │
│                                                   View all projects│
├────────────────────────────────────────────────────────────────────┤  asphalt CTA band
│ │ Working on a project in civil, water or energy infrastructure?   │  laterite left rule, 3px
│ │ Talk to our team.                          [ Contact us ]        │  left-aligned, NOT centred
├────────────────────────────────────────────────────────────────────┤
│ footer — asphalt, logo white variant, nav, legal line, RC, © 2026   │
└────────────────────────────────────────────────────────────────────┘
```

### Home — 360px

```
┌────────────────────────┐
│ [SATO]            ☰    │  logo 28px tall, menu button 44px
├────────────────────────┤
│ Engineering            │  41px display
│ Nigeria's              │
│ infrastructure         │
│ since 1997.            │
│                        │
│ Sato Engineering and   │  lead 21px
│ Infrastructure…        │
│                        │
│ [ Contact us       ]   │  full-width button
│ View our projects      │
│                        │
│ [ full-bleed photo  ]  │  breaks the gutter
├────────────────────────┤
│▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀│  survey bar, plate full-bleed
│ ●                   ●  │
│ COMPANY AT A GLANCE    │
│ Registered name        │  label above
│ Sato Engineering and   │  value below
│ Infrastructure Limited │
│ ────────────────────── │
│ Formerly               │
│ Sato Engineering       │
│ Nigeria Limited        │
│ ────────────────────── │
│ …                      │
│ ●                   ●  │
├────────────────────────┤
│ What we do             │
│ ─────────────────────  │
│ Civil & Infrastructure │
│ Roads, buildings,      │
│ earthworks…          → │
│ ─────────────────────  │
│ …                      │
└────────────────────────┘
```

### Service page — `/services/water-resources` (desktop)

```
┌────────────────────────────────────────────────────────────────────┐
│ header                                                             │
├────────────────────────────────────────────────────────────────────┤
│ Services / Water Resources                                         │  breadcrumbs, 13.6px, steel-ink
│                                                                    │
│ Water Resources                                                    │  h1 52px, cols 1–8
│                                                                    │
│ Dams, irrigation, water supply and river works for government      │  lead, cols 1–7
│ and institutional clients.                                         │
├────────────────────────────────────────────────────────────────────┤
│ [ full-bleed division photograph, 16:6 ]                           │
├────────────────────────────────────────────────────────────────────┤
│ cols 1–7                              │ cols 9–12                  │
│                                       │                            │
│ Water infrastructure has been         │ CAPABILITIES               │  sidebar list, sticky ≥1024
│ central to Sato's work for            │ ───────────────────        │  hairline between items
│ decades, with clients including       │ Earth dam construction     │
│ the Ogun-Osun River Basin             │ ───────────────────        │
│ Development Authority…                │ Irrigation development     │
│                                       │ ───────────────────        │
│ (body, 68ch measure)                  │ Water supply schemes…      │
├────────────────────────────────────────────────────────────────────┤
│ Projects in this division                                          │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│ │ Fiditi Dam  │ │ Ogere Water │ │ Lower Awba  │ │ Ogungbade   │    │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │
├────────────────────────────────────────────────────────────────────┤
│ CTA band — addressed to procurement                                │
└────────────────────────────────────────────────────────────────────┘
```

### Projects index — `/projects` (desktop)

```
┌────────────────────────────────────────────────────────────────────┐
│ header                                                             │
├────────────────────────────────────────────────────────────────────┤
│ Projects                                                           │  h1
│                                                                    │
│ All (16)   Buildings (8)   Roads (3)   Water (5)                   │  filter row, not a <select>
│ ══════════                                                         │  active: 2px green underline
├────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐  │  3-col ≥1024, 2-col ≥768,
│ │ [image 3:2]       │ │ [image 3:2]       │ │ [image 3:2]       │  │  1-col below
│ │ (buildings)       │ │ (water)           │ │ (roads)           │  │  pill tag
│ │ Administrative    │ │ Fiditi Earth Dam  │ │ Campus Roads and  │  │  h3, wdth 112
│ │ Block and Lab     │ │                   │ │ Walkways          │  │
│ │ McPherson Univ.   │ │ Ogun-Osun RBDA    │ │ FCE Osiele        │  │  client, steel-ink
│ │ 2011 · Completed  │ │ 2012 · {{CONF}}   │ │ {{CONF}} · {{..}} │  │  meta, tabular
│ └───────────────────┘ └───────────────────┘ └───────────────────┘  │  1px rule border, no shadow
│ … 16 cards total                                                   │
├────────────────────────────────────────────────────────────────────┤
│ {{CONFIRM: projects delivered since 2012}}                         │  note, highlighted in dev
├────────────────────────────────────────────────────────────────────┤
│ CTA band                                                           │
└────────────────────────────────────────────────────────────────────┘
```

---

## 6. Components

| Component | Notes |
|---|---|
| `Container` | `default` 1280 / `narrow` 68ch / `wide` full. Responsive gutters. |
| `Section` | Vertical rhythm + tone: `concrete` \| `white` \| `asphalt` \| `green`. |
| `Heading` | Levels 1–4, fluid sizes, Archivo width axis. Renders through `RichText`. |
| `Button` | `primary` (green fill) \| `secondary` (laterite outline). Renders `<a>` when `href` is given. |
| `TextLink` | green-ink, 1px underline at 0.15em offset, laterite on hover. No appended arrow. |
| `Logo` | Black variant on light, White variant on dark. Explicit dimensions, no CLS. |
| `Header` | Sticky, concrete, 1px rule. Mobile menu is a client component; everything else is server. |
| `Footer` | Asphalt, white logo, nav, legal line, copyright. |
| `CompanyFactsPanel` | The data plate. Described above. |
| `ProjectCard` | Image, sector pill, title, client, year · status. Square, hairline border. |
| `ClientList` | Typeset register, grouped by category, hairline rules. No invented logos. |
| `PersonCard` | Name, title, bio, qualifications, memberships. `unverified` members carry their placeholder. |
| `CapabilityList` | Hairline-separated list, used as the service page sidebar. |
| `CtaBand` | Asphalt, left laterite rule, left-aligned, one primary button. |
| `Breadcrumbs` | `nav` + ordered list, `aria-current="page"` on the last crumb. |

All components take content through props. No copy is authored inside any of
them (CLAUDE.md rule 1).

---

## 7. Review against the brief

I drafted the above, then went back through it looking for anything that is a
default rather than a decision. Five things changed.

**1. Divisions were four cards in a row. Now they are a schedule.**
Four equal cards with an icon and a summary is the single most common pattern on
an engineering firm's homepage, and it is what I reached for first. Replaced
with full-width rows separated by hairline rules: name in expanded Archivo on
the left, one-line summary on the right. It reads like a capability schedule
rather than a product grid, and it scales honestly when two of the four
summaries are still `{{CONFIRM}}`.

**2. "Trusted by" was a grey logo strip. Now it is a typeset register.**
We have no client logo files, and inventing or scraping them would be both a
content lie and a legal problem. Set the names instead, in three ruled columns.
For a procurement reader, the Federal Ministry of Water Resources set in type
next to a hairline is worth more than a low-resolution GIF.

**3. Selected projects were three identical cards. Now the row is asymmetric.**
One wide card plus two narrow ones. Equal thirds is the template default; the
asymmetry signals editorial judgement about which project matters most, which is
exactly the signal a verifying visitor is reading for.

**4. The CTA band was centred. Now it is left-aligned with a laterite rule.**
Centred white text on a coloured band is the most generic module on the web. The
brief's whole layout direction is left-aligned; the CTA had quietly opted out of
it. Now it matches, with a 3px laterite rule on the left edge.

**5. Radius was going to be a uniform 4px. Now it is 0, with one exception.**
A uniform small radius on everything is the tell of a default Tailwind build.
Structural surfaces are square. The only rounded element is the sector pill,
which quotes the logo's lozenge — roundness became a deliberate reference to the
mark instead of an unexamined default.

Two more checks against the "avoid" list:

- No all-caps eyebrow labels above headings. The only uppercase on the site is
  the data plate's row labels and the logo's own lockup.
- No `→` appended to links. The divisions schedule uses a single chevron as the
  row's affordance because the whole row is the target, which is a different
  thing from decorating every link.

**Still open.** The palette is reconciled to the logo, but the logo supplied is
raster (PNG). Final SVG would let the header mark scale cleanly and would let us
confirm whether the two-tone green split is intentional or a compression
artefact. The hero and division photography is also still the 2012 low-resolution
set, so every image slot in these wireframes is currently empty.
