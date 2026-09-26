import { REVIEW_COPY } from "@/lib/review-mode";
import { cn } from "@/lib/cn";

/**
 * Marks a page whose copy Sato has not approved.
 *
 * Only ever rendered on a review deployment — see `lib/review-mode.ts`. It is
 * deliberately loud: the whole point of the review URL is that nobody mistakes
 * a draft for a published page.
 */
export function DraftNotice({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn("border-l-[6px] border-survey bg-asphalt px-5 py-4 text-concrete", className)}
    >
      <p className="text-2xs font-bold uppercase tracking-[0.1em] text-survey wdth-body">
        {REVIEW_COPY.draftLabel}
      </p>
      <p className="mt-1 max-w-(--container-measure) text-sm wdth-body">
        {REVIEW_COPY.draftBody}
      </p>
    </div>
  );
}

/** Sitewide strip on a review deployment, above the header. */
export function ReviewBanner() {
  return (
    <div className="bg-survey px-5 py-2 text-asphalt">
      <p className="text-2xs font-bold uppercase tracking-[0.1em] wdth-body">
        {REVIEW_COPY.siteLabel}
        <span className="ml-3 font-normal normal-case tracking-normal">
          {REVIEW_COPY.siteBody}
        </span>
      </p>
    </div>
  );
}
