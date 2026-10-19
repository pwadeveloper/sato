# Prompt 17 — Mirror the current site's project content faithfully

The client likes the new site's design, especially Oil & Gas. His problem is **content accuracy**:
- The same building photo appears in several categories.
- Some photos sit on the wrong project, or don't fit the project's context.
- The photos he recently sent duplicate what's already on the current site.

The current site (https://www.satoengineering.com) already has the right content: each project category page shows its photos with a **caption under each picture**, and projects have accurate titles and written narratives. **The goal is to mirror that content faithfully in the new site's design, not to rewrite or reinterpret it.**

**For project content, the current live site is the source of truth.** Where the new site disagrees with it, the current site wins, unless the difference is one of the deliberate rules in "What stays changed" below.

Save this file as `docs/decisions/mirror-old-site-content.md`. Commit nothing.

---

## What stays changed (do not undo)

These are deliberate decisions from earlier rounds. Apply them while mirroring:
- No "Nigeria", "Nigerian", "formerly" or the former company name in any visible text, alt text or metadata. Where an old caption says "by Sato Engineering Nigeria Limited", write "by Sato". (The founder's bio exemption on /leadership stays as it is.)
- The site structure from prompt 14 (project categories mirroring Services; Civil Engineering & Construction with "Buildings" and "Roads & Pavements" subheadings; Water Resources Development & Management). Mirror the **content** into these categories, keeping the old site's grouping as subheadings where it adds clarity.
- No project is labelled "Ongoing" as a status badge. Photo captions that say "Work in progress" describe what the photo shows at the time; keep them as captions.
- The photo safety rule from prompt 16 (no workers without helmets in published photos).
- Oil & Gas content, attribution and review gate: unchanged.

## 1. Capture the current site completely

Crawl every project-related page of the live site. If a page fails (some loop on redirects), use the most recent Wayback Machine snapshot and note which source you used for each page.

Pages: `/projects/`, `/building-and-construction/`, `/water-supply-and-water-resources/`, `/civil-eng-road-projects/`, `/ongoing-projects/`, `/work-in-progress/`, `/project-1/` to `/project-4/`, every project or news post they link to, plus the homepage "Ongoing Projects" block and `/news-events/`.

For **every image** on those pages, record in `docs/old-site-inventory.json`:
- the page it appears on, and its position on that page (order matters)
- the original image URL (full size, not the WordPress `-300x200` thumbnail if a larger one exists)
- the caption shown under it, exactly as written
- any heading or narrative text the image belongs to
- the image's title and alt attribute

Also record every narrative paragraph (e.g. "SATO Engineering has completed the construction of Administrative building and Laboratory for McPherson University Ajebo Ogun State…") and which project it describes.

Download any old-site image the new site doesn't already have, at full size, into `raw-assets/old-site/` (gitignored).

## 2. Audit: compare old and new, before changing anything

Write `docs/content-audit.md`, one section per project category, with a table:

| Old site: image + caption | Old site: page / project | New site: where it appears now | Problem | Fix |
|---|---|---|---|---|

Flag every:
- **Duplicate:** the same photo (compare with a perceptual hash, not filenames) used in more than one place on the new site
- **Wrong project:** a photo on a new-site project that the old site places on a different project or page
- **Missing photo:** an old-site photo not on the new site
- **Missing or changed caption:** an old-site caption absent from the new site, or reworded beyond the clean-up in section 3
- **Missing narrative:** old-site project text not on the new site
- **New-site extra:** a photo or text on the new site that isn't on the old site, with its source (prompt 16 batch, AI-generated, etc.)
- **Projects:** any project on one site but not the other

Include a summary at the top: counts for each problem type.

## 3. Realign the content

**Photos and captions**
- Every project photo comes from the old site, placed on the project and in the order the old site uses.
- Every photo shows **its old-site caption directly beneath it** on the project detail page. This is the main visible change the client is asking for. Captions also become the basis of the alt text.
- Caption clean-up only, nothing more:
  - Convert ALL CAPS captions to sentence case, keeping proper nouns and acronyms (e.g. "Laying of asphalt at Federal College of Education, Osiele").
  - Fix clear typos only (e.g. "SUB-BASESE" → "sub-base", "PROGRS" → "progress", "ASPHALT BEEN COMPACTED" → "Asphalt being compacted").
  - Apply the "no Nigeria / former name" rule above.
  - Record each original caption next to its cleaned version in `docs/caption-changes.md`, so the client can check none changed in meaning.
- **One photo, one place.** A photo appears on one project only, and as a category tile or service header only if it's the best photo of a project in that category. No photo may represent two different projects or two categories. (Exception: the same photo can appear as a project's card image and on its own detail page.)
- Use the highest-resolution version available of each old-site photo. If the prompt 16 batch contains the full-size original of an old-site photo (match by perceptual hash), use that file, with the old site's caption and project placement.

**Narratives and titles**
- Each project's title and description mirror the old site's wording (same clean-up rules). Where the new site has a shorter summary, replace it with the old site's narrative.
- Project details (client, location, year) follow the old site where it states them.

**Photos from the prompt 16 batch**
- Any batch photo that duplicates an old-site photo: handled as above (old placement and caption win).
- Any batch photo that's genuinely new (not on the old site): remove it from projects and categories for now, and list it in the audit as "new photo, awaiting client confirmation". Don't use it until the client confirms where it belongs. It can stay in a service gallery only if it was matched at High confidence in prompt 16 and isn't on a project page.
- Keep the About page collage only if all four photos are correctly identified Ogere/Arakanga water works; otherwise use the single strongest correctly identified water photo.

**Category tiles and service headers**
- Each uses a different photo, chosen from that category's own projects.

**Ongoing Projects**
- The old site's "Ongoing Projects" items: place each under its project (most already exist on the new site). Keep their captions; no "Ongoing" status badge.

## 4. Check

- Run a duplicate check across all published images (perceptual hash) and confirm no photo appears on two projects or two categories.
- Spot-check five projects against the old site side by side and confirm the photos, order, captions and narrative match.
- `npm run build` passes; the banned-terms, contact and placeholder checks behave as before.

## 5. Report

- The summary counts from `docs/content-audit.md`, before and after
- Screenshots of: one Buildings project, one Roads project and one Water project detail page (desktop and mobile) showing photos with captions; the Projects landing page; the Civil Engineering & Construction category page
- `docs/caption-changes.md`
- A short list called **"For the Zoom call"**: anything you couldn't resolve from the old site alone (conflicting information between old-site pages, photos with no caption, new-batch photos awaiting placement, projects on only one site). Keep it to the decisions only the client can make.

---

## Amendments given when the prompt was confirmed

1. **October-batch photos: don't remove everything the old site doesn't have.**
   The client's complaint was duplicates and photos on the wrong project, not
   new photos as such.
   - Keep new photos that were matched at High confidence AND sit on a
     project that exists on the old site (e.g. Unilag Creative Arts:
     filename, signboard and GPS all agree; he mentioned that photo himself).
     Ijaiye and Ilaro stay only if their match was High confidence.
   - Hold, and take off projects: anything matched at Medium (e.g.
     Ogungbade), all the FUNAAB building photos, and anything that duplicates
     or conflicts with the old site's placement.
   - List every kept new photo in the audit under "New-site extra (kept, High
     confidence)" so the client can confirm or reject each one when he
     reviews.
2. **Commits:** not to main. Work on the branch `content/mirror-old-site`,
   commit in logical steps (inventory and audit, then realignment), and push
   the branch so Vercel builds a preview deployment for the client. Don't
   merge to main; that happens after he approves.
