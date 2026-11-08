# Prompt 18 — Final structure, old-site images, hide Leadership, launch-ready

Client call, final round before launch. **Target: launch-ready tonight.** Implement everything below in one pass. Where this file conflicts with earlier prompts or docs, this file wins. Save it as `docs/decisions/launch-ready.md`.

Work on the `content/mirror-old-site` branch if it exists (it holds the prompt 17 work); otherwise create it from `main`. Commit in logical steps on that branch and push it so Vercel builds a preview. Don't merge to `main` and don't touch the production domain; I'll do that after a final check.

---

## 0. Review status

> - **A. The client has approved all draft service pages.** Set every service to `"reviewStatus": "approved"`.

**The two Oil & Gas placeholders:** resolve them with the safe defaults, so they no longer need an answer:
- Equipment manufacturers: keep the categories and brand names, with no "authorised", "official" or "distributor" wording. Remove the `{{CONFIRM}}` marker.
- Case study: keep the client as "a national oil company". Don't name ADNOC. Remove the `{{CONFIRM}}` marker.

Apart from that, **leave Oil & Gas untouched**.

---

## 1. Four categories: Services and Projects mirror each other exactly

The client has agreed the final categories, following the old site's structure (Building and Construction; Water Supply and Resources; Civil Engineering and Road), with "Ongoing Projects" replaced by Electrical and Mechanical:

| # | Name | Services route | Projects route |
|---|---|---|---|
| 1 | Building and Construction | `/services/building-construction` | `/projects/building-construction` |
| 2 | Water Resources Development and Management | `/services/water-resources-development-management` | `/projects/water-resources-development-management` |
| 3 | Civil Engineering and Road | `/services/civil-engineering-road` | `/projects/civil-engineering-road` |
| 4 | Electrical and Mechanical | `/services/electrical-mechanical` | `/projects/electrical-mechanical` |

- Use the names exactly as written, with "and" (not "&") in these four.
- These four replace the current Infrastructure sub-services (Civil Engineering & Construction, Electrical Engineering, Mechanical Engineering, Water Resources Development & Management) and the current project categories for that work. The "Infrastructure Services" heading stays as the group above them.
- **Services and Projects must mirror each other exactly:** same four names, same order, same grouping, in the nav dropdowns, on the Services page, on the Projects landing page and in the footer. A category shows on Projects only if it has projects, as before; if Electrical and Mechanical has projects (e.g. the bulk meter supply projects, pump installation), it shows.
- Split the current Civil Engineering & Construction projects using the old site's own grouping: its "Building and Construction" page → category 1; its "Civil Engineering Road Projects" page → category 3. Water projects → category 2. Electrical, mechanical and pump work → category 4 (a project can also stay in Water if the old site lists it there).
- Content for the four service pages: merge the existing content into the new structure (Building and Construction takes the buildings content; Civil Engineering and Road takes the civil and roads content; Electrical and Mechanical merges the two former pages, keeping the Capabilities/Solutions template from prompt 15). No new copy beyond joining sentences.
- **Oil & Gas** stays exactly as it is, in both Services and Projects. Energy Services, Digitalization & Digital Twin and Research, Technology & Innovation keep their current place on Services, subject to section 0.
- 301 redirects from every retired route (the old service sub-pages, `/projects/civil-engineering-construction`, `/projects/electrical-engineering`, and anything from earlier redirects that pointed at them) to the matching new route. Check there are no redirect chains.

## 2. Old-site images with their original descriptions

Every project image from the old site goes onto the new site **with its original description underneath**. The descriptions are specific and the client cares about them (e.g. "Installing pump at Shagamu", "World Bank team inspecting Shagamu intake").

- If the prompt 17 work exists (`docs/old-site-inventory.json`, `docs/content-audit.md`), use it and finish anything still outstanding. If not, do the capture and mapping from prompt 17 sections 1–3 now.
- Apply the same caption clean-up as prompt 17 (sentence case, clear typos, no "Nigeria" or former name), **plus section 4 below (no dates)**. Otherwise keep the wording.
- One photo, one place. No photo on two projects or two categories.

## 3. New images from the client's email

The client resent his 16 October email (11 attachments), which includes new images. I've saved the attachments to `raw-assets/client-photos/_inbox/email-2026-11-08/` with their original filenames. Any descriptions from the email body are in `captions.txt` in the same folder.

- Compare each file with everything already processed (perceptual hash). Files already used: skip. New files: process them.
- Use the filename and `captions.txt` as the description, cleaned up the same way. Place each photo on the project its description names (e.g. Shagamu pump installation and the World Bank inspection → the Sagamu intake project; also Electrical and Mechanical if it shows pump installation). If a photo has no description and no clear project, leave it out and list it.
- Photos of identifiable people are fine here when the description shows a professional context (e.g. the World Bank inspection). Still exclude anything showing unsafe practice (no helmets on an active site) and any burned-in date stamp you can't crop out.
- Strip all metadata (GPS, camera, dates) from every published image, and verify it by script.

## 4. Remove all dates

The client wants **no dates** on images or project entries.
- Set `showProjectDates: false` and confirm nothing date-related renders on project cards, project pages or category pages: no years, no "Awarded 2012", "completed 2011" or similar.
- Remove dates from every caption, project title, narrative and alt text (e.g. "awarded in 2016", "2012", "November 2011"). Rephrase only as much as needed for the sentence to read correctly.
- Exclude or crop photos with a date stamp burned into the image.
- Keep "since 1997" and "nearly three decades" in company copy; those describe the company, not projects.
- Add `/\b(19|20)\d{2}\b/` on project pages and project captions to the build checks (allowing "1997" only where it's in the company tagline), and show me the result.

## 5. Hide the Leadership page

Not finalised, so hide it but don't delete it.
- Remove it from the nav, footer, sitemap, internal links and JSON-LD, and exclude its route from the build (same approach as HSE). Redirect `/leadership` and the old `/our-team/` to `/about`.
- Keep all its content and components, plus a `showLeadership: false` switch in site.json, so it can return with one change.
- The founder-bio exemption in the banned-terms check can stay; it simply won't match anything while the page is hidden.

## 6. Launch readiness

1. `npm run build:prod` must pass. Report anything that still blocks it.
2. Run the banned-terms, contact-details, placeholder and new date checks; show the output.
3. Check every old WordPress URL in the redirect map, plus the new retired routes, resolves to a live page in one hop.
4. Contact form: confirm whether `contactFormEndpoint` is set. If it isn't, say so clearly at the top of your report.
5. Update `docs/deploy.md` with a cutover checklist for connecting satoengineering.com to Vercel, **covering how to keep the company's email working**:
   - Record every existing DNS record before changing anything, especially **MX, SPF/TXT and any mail-related CNAMEs** for info@satoengineering.com.
   - Prefer adding Vercel's A/CNAME records at the current DNS provider over changing nameservers. If nameservers must change, recreate all the mail records first.
   - Steps for both `satoengineering.com` and `www`, the expected propagation time, and how to verify email still works after the switch (send and receive a test message).
   - How to roll back (restore the old A record) if something goes wrong.

## Done when

- Services and Projects show the same four infrastructure categories with the agreed names, in the same order; Oil & Gas is unchanged
- Every old-site project image is on the new site with its description, with no dates anywhere in project content
- New email images are placed by their descriptions, or listed if unplaceable
- Leadership is hidden and redirects; nothing links to it
- `npm run build:prod` passes, and all checks pass
- The branch is pushed with a preview URL

Report back with: the preview URL; screenshots of the Services dropdown, the Projects dropdown and landing page, one project page from each of the four categories, and the Sagamu project page (desktop and mobile); the check outputs; any photos you couldn't place; and the contact form status.

---

