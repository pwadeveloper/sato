import Link from "next/link";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { DraftNotice } from "@/components/DraftNotice";
import { PageHeader } from "@/components/PageHeader";
import { PartnerProjects } from "@/components/PartnerExperience";
import { CategoryGallery, ProjectList } from "@/components/CategoryGallery";
import { ResultsGrid } from "@/components/ResultsGrid";
import { Reveal } from "@/components/Reveal";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { UseCaseCard } from "@/components/UseCaseCard";

import {
  getPage,
  getPartnerBlock,
  getCategoryPhotos,
  getPartnerCategoryService,
  getProjectCategories,
  getProjectCategory,
  getProjectsInCategory,
  getFeaturedResults,
  getSection,
  getServiceResults,
  getSite,
  getUseCases,
  isPartnerCategory,
} from "@/lib/content";
import type { CtaSection } from "@/lib/content-types";
import { buildPageMetadata } from "@/lib/metadata";
import { isReviewMode } from "@/lib/review-mode";

/**
 * One project category.
 *
 * The category routes are separate files because a second dynamic segment
 * cannot sit beside `/projects/[slug]`. They hold nothing but the slug —
 * everything a category page is lives here, and every word of it comes out
 * of `pages/projects.json`, so adding a category is a content edit plus a
 * four-line route file.
 *
 * A category draws its projects from one of two places. Most take them from
 * `projects.json` and render the way the old site did, on the client's
 * instruction: every photograph in the category mixed into one gallery, each
 * with its caption in small plain text, then a plain list of the projects —
 * so a project with no photograph of its own is a line in the list, never an
 * empty frame. Oil & Gas takes them from the
 * `partner` block on its service, because those rows are client, project and
 * year with no scope, no photographs and no detail page — a table is the
 * honest shape for them, and duplicating twenty-six rows into `projects.json`
 * to force them into a card grid would have invented four fields each.
 *
 * Partner-delivered work carries an attribution line, wherever it appears and
 * whichever source it came from. That is automatic — `isPartnerCategory`
 * reads it off the category or off the projects in it — so the digital twin
 * and research projects arriving from the partner will carry it without
 * anyone having to remember.
 */
export function buildCategoryMetadata(slug: string): Metadata {
  const page = getPage("projects");
  const category = getProjectCategory(slug);

  return buildPageMetadata(
    {
      ...page,
      slug: `projects/${slug}`,
      title: category.label,
      metaTitle: category.label,
      metaDescription: category.intro || page.metaDescription,
      ogImage: category.image ?? page.ogImage,
    },
    getSite(),
  );
}

export function ProjectCategoryPage({ slug }: { slug: string }) {
  const page = getPage("projects");
  const site = getSite();
  // A category may supply its own CTA by id, as a service may.
  const cta: CtaSection = page.sections.some((section) => section.id === `cta-${slug}`)
    ? getSection(page, `cta-${slug}`, "cta")
    : getSection(page, "cta-default", "cta");
  const labels = page.labels ?? {};

  const category = getProjectCategory(slug);
  const others = getProjectCategories().filter((entry) => entry.slug !== slug);

  const partner = getPartnerBlock(category);
  const photos = partner ? [] : getCategoryPhotos(category);
  const projects = partner ? [] : getProjectsInCategory(category);
  const attribution = isPartnerCategory(category)
    ? labels.partnerAttribution ?? ""
    : "";

  // A partner-sourced category is only as approved as the service it reads
  // from, so it carries that service's review state with it.
  const partnerService = getPartnerCategoryService(category);
  const draft = partnerService?.reviewStatus === "draft";

  // The proof, ahead of the record: the use cases written up in full, and
  // "Results at a glance" — each use case's headline results, then the
  // published results the record names, read from the service page so the
  // two never carry different wording.
  const useCases = category.serviceSlug ? getUseCases(category.serviceSlug) : [];
  const glance = [
    ...useCases.flatMap((useCase) => getFeaturedResults(useCase)),
    ...(partnerService && partner?.highlightResultIds
      ? getServiceResults(partnerService, partner.highlightResultIds)
      : []),
  ];

  return (
    <>
      <PageHeader
        title={category.label}
        intro={category.intro ? [category.intro] : []}
        image={category.image}
        headingId="category-heading"
        above={
          <>
            <Breadcrumbs
              trail={[{ label: page.title, href: "/projects" }]}
              current={category.label}
              label={labels.breadcrumb ?? page.title}
            />
            {isReviewMode && draft ? <DraftNotice className="mt-6" /> : null}
          </>
        }
      />

      {/* No `labelledBy`: the card grid needs none, and `PartnerProjects`
          labels its own inner sections. */}
      <Section tone="concrete">
        <Container>
          {/* Whose work this is, before the reader meets the first row. */}
          {attribution ? (
            <p className="mb-8 max-w-(--container-measure) border-l-[3px] border-brand py-1 pl-5 text-base font-semibold wdth-body">
              <RichText text={attribution} />
            </p>
          ) : null}

          {glance.length ? (
            <ResultsGrid
              heading={labels.resultsAtAGlance ?? ""}
              groups={[{ id: "glance", items: glance }]}
              headingId="results-at-a-glance"
              headingLevel={2}
              className="mb-16"
            />
          ) : null}

          {useCases.length ? (
            <section aria-labelledby="use-cases-heading" className="mb-20">
              <h2 id="use-cases-heading" className="eyebrow text-steel-ink">
                <RichText text={labels.useCases ?? ""} />
              </h2>
              <div className="mt-4 flex flex-col gap-6">
                {useCases.map((useCase) => (
                  <UseCaseCard
                    key={useCase.slug}
                    href={`/projects/${category.slug}/${useCase.slug}`}
                    eyebrow={labels.useCase ?? ""}
                    title={useCase.title}
                    clientDisplay={useCase.clientDisplay}
                    results={getFeaturedResults(useCase)}
                    linkLabel={labels.useCaseLink ?? ""}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {partner && labels.projectRecord ? (
            <h2 className="eyebrow mb-4 text-steel-ink">
              <RichText text={labels.projectRecord} />
            </h2>
          ) : null}

          {partner ? (
            <PartnerProjects
              partner={partner}
              headingId="category-record"
              showDates={site.showProjectDates}
            />
          ) : (
            <>
              <CategoryGallery
                photos={photos}
                label={labels.gallery ?? category.label}
              />
              <ProjectList
                projects={projects}
                heading={labels.projectList ?? ""}
                headingId="category-project-list"
                className={photos.length ? "mt-16" : undefined}
              />
            </>
          )}
        </Container>
      </Section>

      {others.length ? (
        <Section tone="white" labelledBy="other-categories">
          <Container>
            <h2
              id="other-categories"
              className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body"
            >
              <RichText text={labels.otherCategories ?? ""} />
            </h2>

            <ul className="mt-4 grid gap-px border border-rule bg-rule md:grid-cols-2">
              {others.map((other) => (
                <li key={other.value}>
                  <Link
                    href={`/projects/${other.slug}`}
                    className="group flex h-full items-center justify-between gap-4 bg-white p-6 no-underline transition-colors duration-150 hover:bg-brand-tint"
                  >
                    <span className="text-xl font-bold wdth-heading text-balance text-asphalt">
                      <RichText text={other.label} />
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-steel transition-transform duration-150 group-hover:translate-x-1 group-hover:text-brand"
                    >
                      &rarr;
                    </span>
                  </Link>
                </li>
              ))}

              {/* The 1px rules between cells are the container's background
                  showing through a `gap-px` grid, so an incomplete last row
                  leaves a grey block rather than a gap. With four categories
                  there are three others and the two-column grid is one short;
                  these fill the remainder. */}
              {Array.from({ length: (2 - (others.length % 2)) % 2 }).map((_, index) => (
                <li key={`filler-${index}`} aria-hidden="true" className="bg-white" />
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <CtaBand
        heading={cta.heading}
        body={cta.body}
        ctas={cta.ctas}
        headingId={`cta-${slug}`}
      />
    </>
  );
}
