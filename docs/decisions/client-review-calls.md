# Prompt 14 — Client review calls (two calls, one batch)

Two review calls with the client. Implement everything below in one pass. **Where this file conflicts with earlier prompts or docs, this file wins.** Update CLAUDE.md and docs/site-content.md to match, and save this file as `docs/decisions/client-review-calls.md`.

Where the two calls disagree, the later call wins; this file already reflects that. Items marked **On hold** must not be changed.

Start with a short plan, then proceed.

---

## 1. Navigation: Projects lives in one place only

- Remove "Projects" from the Oil & Gas sub-items in the **Services dropdown** and from the Oil & Gas sub-links line on the **Services page**. Projects already has its own top-level nav item, and both pointed to the same page.
- **On hold:** the in-page sub-nav on the Oil & Gas service page (Capabilities · Solutions · Projects · Partnerships) stays exactly as it is. The client wants to discuss it before anything is removed.

## 2. Projects: mirror the Services structure

The Projects dropdown and landing page should follow the same structure as Services: each service with its own projects.

### Categories (same order and names as Services)

| Group | Category | Route |
|---|---|---|
| Infrastructure Services | Civil Engineering & Construction | `/projects/civil-engineering-construction` |
| Infrastructure Services | Electrical Engineering | `/projects/electrical-engineering` |
| Infrastructure Services | Mechanical Engineering | `/projects/mechanical-engineering` |
| Infrastructure Services | Water Resources Development & Management | `/projects/water-resources-development-management` |
| — | Energy Services | `/projects/energy` |
| — | Oil & Gas Services | `/projects/oil-gas` (unchanged) |
| — | Digitalization & Digital Twin Services | `/projects/digital-twin` |
| — | Research, Technology & Innovation Services | `/projects/research-innovation` |

- Change `projects.json` so each project has a `categories` array (a project can belong to more than one category) instead of a single sector.
- Re-map existing projects:
  - The current **Buildings & Construction** and **Civil Engineering & Roads** projects → Civil Engineering & Construction. On that category page, keep two subheadings, "Buildings" and "Roads & Pavements", so nothing gets buried.
  - Current **Water Resources Development & Management** projects → unchanged.
  - The two bulk meter supply projects (USAID E-WASH; World Bank / Federal Ministry of Water Resources) → **both** Water Resources Development & Management **and** Electrical Engineering.
  - Oil & Gas partner projects and case study → unchanged, with attribution and the review gate as before.
- **A category with no projects is not shown** in the dropdown, the landing page or the sitemap. Right now that hides Mechanical Engineering, Energy Services, Digitalization & Digital Twin, and Research, Technology & Innovation. Each appears automatically once it has a project. Never publish an empty category page.
- Dropdown layout mirrors the Services dropdown: an "Infrastructure Services" heading with its (non-empty) sub-categories indented, then the other categories.
- Landing page `/projects`: one photographic tile per visible category, in the same order, grouped the same way.
- 301 redirects: `/projects/buildings-construction` and `/projects/civil-engineering-roads` → `/projects/civil-engineering-construction`.
- Each service page's "See our … projects" link (from prompt 13) now points to its matching category, and only appears when that category is visible.
- **Incoming:** the client's partner (Dele) will supply projects for Digitalization & Digital Twin and Research, Technology & Innovation. When they arrive, they are partner projects: same attribution line and review gate as Oil & Gas. Add a `deliveredBy: "sato" | "partner"` field to every project now (all current Sato projects `"sato"`, the Oil & Gas projects `"partner"`), and make every category page show the attribution line automatically for partner projects. List these categories in `docs/open-items.md` as awaiting content.

## 3. Oil & Gas service page

- **Remove the Recognition block** (the 2015 SPE International P&O Award and the university partnerships). It isn't Sato's own recognition. The Partnerships section keeps the partner team description and the (still hidden) partner name.
- **Value map diagram too large:** the client says it forces too much scrolling. Reduce its displayed size by 20% at every breakpoint (set a max-width 80% of its current rendered width, centred). Don't crop or edit the image itself. Check it's still legible on desktop; on mobile it keeps its scrollable container.
- The client also referred to "the hero image" being too large. I believe this is the same diagram. **Don't resize any hero/header photos** in this batch; I'll confirm on the next call.

## 4. Home: remove the Vision

- Remove the Vision block from the Home page. The client wants Mission and Vision kept together, and both are already on the About page. Home is now: welcome (heading and text) and the motto.
- Add a site.json switch `"homeShowMissionVision": false`. When `true`, Home shows **Mission and Vision together** as a pair, below the motto. The client may choose that option instead, so it must be a one-line change.
- Confirm the About page still shows Motto, Mission and Vision together.

## 5. About: image beside the text

- On desktop (≥1024px), change About to two columns: the text on the left (roughly 7/12) and a tall photograph on the right (5/12), top-aligned with the first paragraph. Make the image `position: sticky` so the right side never looks empty while reading, if that works well visually; otherwise size it to the text height with `object-fit: cover`.
- Use the strongest project photograph available. It'll be swapped for one of the client's new photos when they arrive (section 8).
- Below 1024px, the image sits above the text, full width, with a moderate height (not a full-screen hero).
- Alt text describes the project shown.

## 6. Footer and Contact

- **Footer:** remove the phone number and email. The footer keeps the company name, © year and the links. Contact details stay on the Contact page only.
- **Contact, Abeokuta Office:** add the full street address from the current live website's contact page: "IBB Boulevard, opposite Southwest Resource Centre, Oke-Mosan, Abeokuta, Ogun State". Copy the exact wording and punctuation from the live page (use the Wayback Machine if the page loops) and show me what you used.
- **On hold:** don't change the Lagos address format. The client talked about showing the area and a nearby bus stop in brackets, but the contact page will be revisited on the next call. Do report what the live site's Lagos address says exactly, including any bus stop detail, so I have it ready.

## 7. Leadership: no change

**On hold.** Leave the Leadership page exactly as it is. The client is adding two or three more people, and the page will be restructured once they're in (possibly with profiles that open on click).

## 8. Get ready for the client's photos

The client is sending labelled photos of completed work for Civil Engineering & Construction, Electrical Engineering, Mechanical Engineering and Water Resources Development & Management.

- Create `/raw-assets/client-photos/` (gitignored) with one subfolder per service: `civil-engineering-construction/`, `electrical-engineering/`, `mechanical-engineering/`, `water-resources-development-management/`.
- Extend `scripts/optimise-images.mjs` so that running it processes any new photos in those folders into `/public/images/services/<service>/` and writes a manifest listing each file with its original filename (the client's label).
- Add an optional `images` array to each service in services.json (header image plus gallery), and support a small gallery on the four Infrastructure service pages that renders only when images exist.
- Don't map any photos yet; there are none. Add a short `docs/adding-client-photos.md` explaining the drop-in-folder → run script → map in JSON steps, so the next update is quick.

## Done when

- The Services dropdown and Services page no longer list "Projects" under Oil & Gas; the Oil & Gas in-page sub-nav is unchanged
- Projects dropdown and landing mirror the Services structure, show only non-empty categories, and old category URLs redirect
- The bulk meter projects appear under both Water and Electrical
- The Recognition block is gone from Oil & Gas; the value map is 20% smaller and still legible
- Home shows welcome and motto only; `homeShowMissionVision` switches Mission and Vision on together
- About has an image beside the text on desktop
- The footer has no phone or email; the Contact page shows the Abeokuta street address
- Leadership, the Lagos address format and hero photos are untouched
- `npm run build` passes, and the banned-terms and contact checks still pass

Report back with screenshots of Home, About, the Services dropdown, the Projects dropdown and landing page, the Civil Engineering & Construction projects page, the Oil & Gas value map, the footer and the Contact page (desktop and mobile), plus the exact Abeokuta and Lagos addresses from the live site.
