Review call, 10 November: two photo fixes in Water Resources.

1. "Positioning of ductile iron pipe" photo ("Dr. Lion pipe" in the call notes):
   crop out the shirtless worker. From the full-resolution original, keep 44%
   to 94% of the width at full height. That removes the shirtless man and the
   half-visible person at the right edge, and keeps the pipe and the two hi-vis
   workers. Keep the original file untouched and save the crop as a new image.
   Caption: "Positioning of ductile iron pipe".
2. "Lime dosing pump" photo (4th on the left; "line dosing pump" in the call
   notes): caption "Lime dosing pump installed". Check every extracted photo
   for a better view of the dosing pumps. If there is one, show both side by
   side but don't swap yet; if not, keep the current one.

---

## What was done

### 1. Ductile iron pipe: cropped

- **The old site's copy is the original.** `raw-assets/old-site/2012/07/21.jpg`
  is 564×450. No client batch holds a larger copy: hashed against all 175
  extracted photographs (October, both Word documents, the 10 November
  batch), the nearest is pHash 20, a road-surfacing photograph (≤ 10 is the
  same photograph). So the 44–94% crop was cut from that file, as the brief
  asked.
- The crop is `[0.44, 0, 0.5, 1]` in `scripts/client-photo-selection.json`
  and comes out at **282×450**. The pipeline never enlarges, so both
  published sizes are 282px wide. A portrait photograph sits whole in the
  gallery's 4:3 frame, so it shows complete, letterboxed, at about its own
  size.
- It matches the reference crop: the pipe, the worker beside it, and the
  second hi-vis worker in a helmet at the left edge (cut by the frame, as in
  the reference). Nobody is shirtless.
- **New file**, `ductile-iron-pipe-positioning.webp`. The uncropped
  `ductile-iron-pipe-laying-roadside*.webp` are deleted from `public/images`,
  so the old frame can't be reached by URL. The source `21.jpg` is untouched.
- Caption **"Positioning of ductile iron pipe"**. Alt: "Two workers in hi-vis
  vests guiding a ductile iron pipe into place beside the road".
- The vest print under the logo is the same pixels the site already
  published: a smudge at 282px, nothing legible.

### 2. Lime dosing pump: caption fixed, photograph kept

- Caption **"Lime dosing pump installed"**, alt "Lime dosing pump mounted on
  the wall of a chemical house" (singular, as the photograph shows one pump
  whole).
- **No better view exists.** A contact sheet of all 175 extracted photographs
  shows dosing pumps in two only: this one (W070) and the alum dosing pumps
  (W071), which is already beside it on the page and does show two pumps. The
  old site has no dosing photograph. So nothing was swapped.
- Why only one pump shows: the source frame has two pumps, but a fitter
  crouches in front of the second in a vest printed with the former company
  name and the country, legible at full size. The 9 November crop keeps the
  left 42% for that reason. Widening it enough to show the second pump whole
  would bring the vest print back into frame.

### Checks

- `npm run build:prod`: placeholders, image metadata (348 files clean),
  build, banned terms, dates, redirects (131).
- Content audit: 0 duplicates, 0 wrong projects, 0 changed captions; totals
  otherwise unchanged.
- Screenshots (desktop 1440, mobile 375), in
  `docs/screenshots/review-call-2026-11-10/`: both photographs in the Water
  Resources gallery, and on the Ogere project page.
