import Link from "next/link";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { DraftNotice } from "@/components/DraftNotice";
import { PageHeader } from "@/components/PageHeader";
import { PartnerProjects } from "@/components/PartnerExperience";
import { CategoryGallery, ProjectList } from "@/components/CategoryGallery";
import { Reveal } from "@/components/Reveal";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";

import {
  getPage,
  getPartnerBlock,
  getCategoryPhotos,
  getPartnerCategoryService,
  getProjectCategories,
  getProjectCategory,
  getProjectsInCategory,
  getSection,
  getSite,
  isPartnerCategory,
} from "@/lib/content";
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
  const cta = getSection(page, "cta-default", "cta");
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
  const draft = getPartnerCategoryService(category)?.reviewStatus === "draft";

  return (
    <>
      <PageHeader
        title={category.label}
        intro={category.intro ? [category.intro] : []}
        image={category.image}
        transitionName={`category-${category.slug}`}
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
            <p className="mb-10 max-w-(--container-measure) border-l-[3px] border-brand py-1 pl-5 text-base font-semibold wdth-body">
              <RichText text={attribution} />
            </p>
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
        <Section tone="paper" labelledBy="other-categories">
          <Container>
            <h2 id="other-categories" className="eyebrow text-steel-ink">
              <RichText text={labels.otherCategories ?? ""} />
            </h2>

            <ol className="mt-4 border-t border-asphalt">
              {others.map((other, index) => (
                <Reveal key={other.value} as="li" index={index} className="border-b border-rule">
                  <Link
                    href={`/projects/${other.slug}`}
                    className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-5 no-underline md:grid-cols-[3.5rem_1fr_auto]"
                  >
                    <span aria-hidden="true" className="eyebrow tabular text-steel">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="link-draw w-fit text-xl font-bold wdth-heading text-balance text-asphalt transition-colors duration-150 group-hover:text-brand-ink">
                      <RichText text={other.label} />
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-steel transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-1 group-hover:text-brand motion-reduce:transition-none"
                    >
                      &rarr;
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ol>
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
