import { RichText } from "./RichText";
import { ServiceListBlock } from "./ServiceListBlock";
import type { PartnerBlock } from "@/lib/content-types";
import { cn } from "@/lib/cn";

/**
 * A technical partner's track record, kept visibly separate from Sato's own.
 *
 * Every claim in these blocks belongs to the partner team. `PartnerProjects`
 * is the record — the table, the wider engagements and the case study — and
 * it is rendered in one place, `/projects/oil-gas`, under the attribution
 * line that category prints above it. None of it reaches the projects index,
 * Sato's project counts or the structured data. An oil company will check
 * these projects, and finding them presented as Sato's own would end the
 * conversation.
 *
 * `PartnerDetails` is the other half: who the partner is. It sits in the
 * Partnerships section of the service page, and the prose beside it is
 * `sections.partnerships` — the words about the relationship are edited with
 * the rest of that page rather than inside the table's content.
 *
 * There is no recognition block. The partner team's 2015 SPE award and its
 * university partnerships were removed on the client's instruction: they are
 * not Sato's recognition, and a reader on a Sato page has no way to tell that
 * from an award line.
 */
interface PartProps {
  partner: PartnerBlock;
  headingId: string;
  className?: string;
}

/**
 * Who the partner is, where Sato has cleared us to say.
 *
 * Both halves are empty today and both are therefore invisible: the
 * collaborator's name is not yet cleared for publication, and the headline
 * figures contradict each other across the source documents (170 / 250+ /
 * 280+ projects, 6 / 8 patents, 13 / 15 countries), so nothing is guessed at.
 * The block stays so that filling either field in `services.json` is the
 * whole change.
 *
 * It carries no heading of its own. It sits inside the Partnerships section
 * of a service page, under that section's `h2`, and the words around it are
 * `sections.partnerships.intro`.
 */
export function PartnerDetails({ partner, headingId, className }: PartProps) {
  if (!partner.name && !partner.figures.length) return null;

  return (
    <div className={cn(className)}>
      {partner.name ? (
        <p className="max-w-(--container-measure) border-l-[3px] border-brand py-1 pl-5 text-base wdth-body">
          <span className="font-bold">
            <RichText text={partner.nameLabel} />
            {": "}
          </span>
          <RichText text={partner.name} />
        </p>
      ) : null}

      {partner.figures.length ? (
        <dl
          id={headingId}
          className="mt-8 grid grid-cols-2 gap-px border border-rule bg-rule lg:grid-cols-4"
        >
          {partner.figures.map((figure) => (
            <div key={figure.label} className="bg-white p-5">
              <dt className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body">
                <RichText text={figure.label} />
              </dt>
              <dd className="mt-1 text-2xl font-bold tabular wdth-heading text-asphalt">
                <RichText text={figure.value} />
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

/** The record: the project table, the wider engagements and the case study. */
export function PartnerProjects({
  partner,
  headingId,
  className,
}: PartProps) {
  const visible = partner.projects.slice(0, partner.projectsInitialCount);
  const overflow = partner.projects.slice(partner.projectsInitialCount);
  const caseStudy = partner.caseStudy;

  return (
    <div className={cn(className)}>
      <section aria-labelledby={`${headingId}-projects`}>
        <h3
          id={`${headingId}-projects`}
          className="text-xl font-bold wdth-heading text-balance"
        >
          <RichText text={partner.projectsHeading} />
        </h3>

        {/*
          Progressive disclosure with no JavaScript. The overflow rows default
          to visible, and are hidden only by a `:has()` rule in globals.css —
          so a browser without `:has()` simply shows all 26 rows rather than
          hiding rows behind a toggle it cannot operate.
        */}
        <div data-disclosure="rows" className="mt-5">
          {/*
            Below `sm` the year column is dropped and the year is set under
            the client instead, so the table fits a 360px screen without
            sideways scrolling. The column is removed rather than squeezed —
            three columns in 320px leaves the project text unreadable.
          */}
          <div className="sm:overflow-x-auto">
            <table className="w-full border-collapse text-left sm:min-w-[34rem]">
              <thead>
                <tr className="border-y border-asphalt">
                  <th
                    scope="col"
                    className="py-3 pr-6 text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body"
                  >
                    <RichText text={partner.projectColumns.client} />
                  </th>
                  <th
                    scope="col"
                    className="py-3 pr-6 text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body"
                  >
                    <RichText text={partner.projectColumns.project} />
                  </th>
                  <th
                    scope="col"
                    className="hidden py-3 text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body sm:table-cell"
                  >
                    <RichText text={partner.projectColumns.year} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...visible, ...overflow].map((row, index) => (
                  <tr
                    key={`${row.client}-${row.project}`}
                    data-overflow={index >= visible.length ? "" : undefined}
                    className="border-b border-rule align-baseline"
                  >
                    <th
                      scope="row"
                      className="py-3 pr-6 text-sm font-semibold wdth-body"
                    >
                      <RichText text={row.client} />
                      <span className="mt-0.5 block text-xs font-normal tabular text-steel-ink sm:hidden">
                        <RichText text={row.year} />
                      </span>
                    </th>
                    <td className="py-3 pr-6 text-sm wdth-body">
                      <RichText text={row.project} />
                    </td>
                    <td className="hidden py-3 text-sm tabular whitespace-nowrap wdth-body sm:table-cell">
                      <RichText text={row.year} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {overflow.length ? (
            <details className="mt-4">
              <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-brand-ink underline underline-offset-[0.2em] wdth-body">
                <span data-when="closed">
                  <RichText text={partner.projectsShowAllLabel} />
                </span>
                <span data-when="open">
                  <RichText text={partner.projectsShowLessLabel} />
                </span>
              </summary>
              {/* The rows this reveals sit above the control, so say so
                  rather than leaving an expander that appears to open on
                  nothing. */}
              <p className="sr-only">
                <RichText text={partner.projectsDisclosureNote} />
              </p>
            </details>
          ) : null}
        </div>
      </section>

      {partner.engagements ? (
        <ServiceListBlock
          list={partner.engagements}
          headingId={`${headingId}-engagements`}
          headingLevel={3}
          variant="dense"
          className="mt-12"
        />
      ) : null}

      {caseStudy ? (
        <section
          aria-labelledby={`${headingId}-case-study`}
          className="mt-12 border-t-[3px] border-brand bg-white p-6 md:p-10"
        >
          <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-brand-ink wdth-body">
            <RichText text={caseStudy.attribution} />
          </p>

          <h3
            id={`${headingId}-case-study`}
            className="mt-3 text-h3 wdth-heading text-balance"
          >
            <RichText text={caseStudy.heading} />
          </h3>

          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div>
              <h4 className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body">
                <RichText text={caseStudy.challengeHeading} />
              </h4>
              <p className="mt-2 text-base wdth-body text-pretty">
                <RichText text={caseStudy.challenge} />
              </p>
            </div>
            <div>
              <h4 className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body">
                <RichText text={caseStudy.solutionHeading} />
              </h4>
              <p className="mt-2 text-base wdth-body text-pretty">
                <RichText text={caseStudy.solution} />
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body">
              <RichText text={caseStudy.resultsHeading} />
            </h4>
            <p className="mt-2 max-w-(--container-measure) text-sm text-steel-ink wdth-body">
              <RichText text={caseStudy.resultsIntro} />
            </p>
            <ul className="mt-4 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
              {caseStudy.results.map((result) => (
                <li
                  key={result}
                  className="bg-white p-4 text-base font-semibold wdth-body"
                >
                  <RichText text={result} />
                </li>
              ))}
            </ul>
          </div>

          {caseStudy.note ? (
            <p className="mt-6 text-xs text-steel-ink wdth-body">
              <RichText text={caseStudy.note} />
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
