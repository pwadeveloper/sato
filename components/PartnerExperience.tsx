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
 * Empty today, and therefore invisible: the consortium partners are not yet
 * cleared to be named. Filling `partner.name` in `services.json` is the whole
 * change. The headline figures are not here: they sit under the service
 * page's heading, in a `StatStrip` labelled with whose figures they are.
 */
export function PartnerDetails({ partner, className }: PartProps) {
  if (!partner.name) return null;

  return (
    <div className={cn(className)}>
      <p className="max-w-(--container-measure) border-l-[3px] border-brand py-1 pl-5 text-base wdth-body">
        <span className="font-bold">
          <RichText text={partner.nameLabel} />
          {": "}
        </span>
        <RichText text={partner.name} />
      </p>
    </div>
  );
}

/**
 * The record: the project table by region, the patents, the wider
 * engagements.
 *
 * One table with a row group per region, so a screen reader announces the
 * region as the header of every row under it; newest first inside each
 * group, as the content holds them. Patents are a table of their own, after
 * it, because a patent is not a project.
 *
 * `showDates` comes from `showProjectDates` in site.json, the same switch
 * that hides every other project year. Off, the Year column goes entirely,
 * rather than standing empty; the years stay in the content and still give
 * the order.
 */
export function PartnerProjects({
  partner,
  headingId,
  className,
  showDates = true,
}: PartProps & { showDates?: boolean }) {
  const columns = showDates ? 3 : 2;
  const regions = partner.regions
    .map((region) => ({
      ...region,
      rows: partner.projects.filter((row) => row.region === region.id),
    }))
    .filter((region) => region.rows.length > 0);

  const head = "py-3 pr-6 eyebrow text-steel-ink";

  return (
    <div className={cn(className)}>
      <section aria-labelledby={`${headingId}-projects`}>
        <h3 id={`${headingId}-projects`} className="text-h3 wdth-heading text-balance">
          <RichText text={partner.projectsHeading} />
        </h3>
        {partner.projectsIntro ? (
          <p className="mt-2 text-base text-steel-ink wdth-body">
            <RichText text={partner.projectsIntro} />
          </p>
        ) : null}

        <div className="mt-6 sm:overflow-x-auto">
          <table className="w-full border-collapse text-left sm:min-w-[34rem]">
            <thead>
              <tr className="border-y border-asphalt">
                <th scope="col" className={head}>
                  <RichText text={partner.projectColumns.client} />
                </th>
                <th scope="col" className={head}>
                  <RichText text={partner.projectColumns.project} />
                </th>
                {showDates ? (
                  <th scope="col" className={cn(head, "hidden sm:table-cell")}>
                    <RichText text={partner.projectColumns.year} />
                  </th>
                ) : null}
              </tr>
            </thead>
            {regions.map((region) => (
              <tbody key={region.id}>
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={columns}
                    className="pt-8 pb-2 text-left text-lg font-medium tracking-[-0.01em] text-brand-ink"
                  >
                    <RichText text={region.label} />
                  </th>
                </tr>
                {region.rows.map((row) => (
                  <tr key={`${row.client}-${row.project}`} className="border-b border-rule align-baseline">
                    <th scope="row" className="w-[34%] py-3 pr-6 text-sm font-semibold wdth-body">
                      <RichText text={row.client} />
                      {showDates && row.year ? (
                        <span className="mt-0.5 block text-xs font-normal tabular text-steel-ink sm:hidden">
                          <RichText text={row.year} />
                        </span>
                      ) : null}
                    </th>
                    <td className="py-3 pr-6 text-sm wdth-body">
                      <RichText text={row.project} />
                    </td>
                    {showDates ? (
                      <td className="hidden py-3 text-sm tabular whitespace-nowrap wdth-body sm:table-cell">
                        <RichText text={row.year} />
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </section>

      {partner.patents?.items.length ? (
        <section aria-labelledby={`${headingId}-patents`} className="mt-14">
          <h3 id={`${headingId}-patents`} className="text-h3 wdth-heading text-balance">
            <RichText text={partner.patents.heading} />
          </h3>
          <table className="mt-5 w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-asphalt">
                <th scope="col" className={head}>
                  <RichText text={partner.patents.columns.with} />
                </th>
                <th scope="col" className={head}>
                  <RichText text={partner.patents.columns.patent} />
                </th>
                {showDates ? (
                  <th scope="col" className={head}>
                    <RichText text={partner.patents.columns.year} />
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {partner.patents.items.map((item) => (
                <tr key={item.patent} className="border-b border-rule align-baseline">
                  <th scope="row" className="w-[34%] py-3 pr-6 text-sm font-semibold wdth-body">
                    <RichText text={item.with} />
                  </th>
                  <td className="py-3 pr-6 text-sm wdth-body">
                    <RichText text={item.patent} />
                  </td>
                  {showDates ? (
                    <td className="py-3 text-sm tabular wdth-body">
                      <RichText text={item.year} />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {partner.engagements ? (
        <ServiceListBlock
          list={partner.engagements}
          headingId={`${headingId}-engagements`}
          headingLevel={3}
          variant="dense"
          className="mt-14"
        />
      ) : null}
    </div>
  );
}
