/**
 * Review mode — a production build that still shows its own gaps.
 *
 * `npm run build:review` sets `NEXT_PUBLIC_REVIEW_MODE=1`, which is inlined
 * at build time. It turns two things back on that a real production build
 * suppresses: unresolved `{{CONFIRM}}` placeholders are highlighted, and any
 * service still marked `reviewStatus: "draft"` carries a banner saying so.
 *
 * This exists so the client and his oil and gas collaborator can read the new
 * pages in context, on a real URL, and still see at a glance which parts are
 * not yet approved. It must never be set on the production deployment: the
 * banner and the yellow placeholder marks are internal scaffolding, and a
 * procurement officer landing on them would draw exactly the wrong
 * conclusion.
 *
 * The copy below is that scaffolding, not site content, which is why it lives
 * here rather than in `/content` — there is nothing here for the Phase 2 CMS
 * to edit.
 */
export const isReviewMode = process.env.NEXT_PUBLIC_REVIEW_MODE === "1";

/** Placeholders are visible in development, and on a review deployment. */
export const showPlaceholders =
  process.env.NODE_ENV !== "production" || isReviewMode;

export const REVIEW_COPY = {
  draftLabel: "Not yet approved",
  draftBody:
    "This page is a draft. Nothing on it has been approved for publication, and the production build is blocked until it is. Read it as a proposal.",
  siteLabel: "Review deployment",
  siteBody:
    "Draft pages and unresolved questions are marked. This is not the live site.",
} as const;
