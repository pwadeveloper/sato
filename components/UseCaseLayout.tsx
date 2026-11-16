import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { Heading } from "@/components/Heading";
import { PageHeader } from "@/components/PageHeader";
import { ResultsGrid } from "@/components/ResultsGrid";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";

import {
  getPage,
  getProjectCategories,
  getSection,
  getSite,
  getUseCase,
  getUseCases,
} from "@/lib/content";
import type { CtaSection } from "@/lib/content-types";
import { buildPageMetadata } from "@/lib/metadata";

/** The category a use case sits under: the one mirroring its service. */
function categoryFor(serviceSlug: string) {
  const category = getProjectCategories().find((facet) => facet.serviceSlug === serviceSlug);
  if (!category) {
    throw new Error(`No published project category for service "${serviceSlug}".`);
  }
  return category;
}

export function getUseCaseParams(serviceSlug: string) {
  return getUseCases(serviceSlug).map((useCase) => ({ slug: useCase.slug }));
}

export function buildUseCaseMetadata(serviceSlug: string, slug: string): Metadata {
  const page = getPage("projects");
  const useCase = getUseCase(serviceSlug, slug);
  const category = categoryFor(serviceSlug);

  return buildPageMetadata(
    {
      ...page,
      slug: `projects/${category.slug}/${useCase.slug}`,
      title: useCase.title,
      metaTitle: useCase.title,
      metaDescription: useCase.metaDescription,
      ogImage: useCase.ogImage ?? category.image ?? page.ogImage,
    },
    getSite(),
  );
}

/** One plain list under an `h2`, the shape context and impact share. */
function ListBlock({
  id,
  heading,
  intro,
  items,
}: {
  id: string;
  heading: string;
  intro?: string;
  items: string[];
}) {
  return (
    <section aria-labelledby={`${id}-heading`}>
      <Heading level={2} size="h3" text={heading} id={`${id}-heading`} />
      {intro ? (
        <p className="mt-3 max-w-(--container-measure) text-base text-steel-ink wdth-body">
          <RichText text={intro} />
        </p>
      ) : null}
      <ul className="mt-5 border-t border-asphalt">
        {items.map((item) => (
          <li key={item} className="border-b border-rule py-3 text-base wdth-body text-pretty">
            <RichText text={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * A use case, written up: context, challenges, solution, results, impact.
 *
 * Every word is the use case's own entry in `content/use-cases.json`, and the
 * attribution line is the same one its category prints, so the page cannot
 * read as Sato's own delivery where it is the consortium's.
 */
export function UseCasePage({ serviceSlug, slug }: { serviceSlug: string; slug: string }) {
  const page = getPage("projects");
  const labels = page.labels ?? {};
  const useCase = getUseCase(serviceSlug, slug);
  const category = categoryFor(serviceSlug);
  const ctaId = `cta-${category.slug}`;
  const cta: CtaSection = page.sections.some((section) => section.id === ctaId)
    ? getSection(page, ctaId, "cta")
    : getSection(page, "cta-default", "cta");

  return (
    <>
      <PageHeader
        title={useCase.title}
        eyebrow={`${labels.useCase ?? ""} · ${useCase.clientDisplay}`}
        image={category.image}
        headingId="use-case-heading"
        above={
          <Breadcrumbs
            trail={[
              { label: page.title, href: "/projects" },
              { label: category.label, href: `/projects/${category.slug}` },
            ]}
            current={useCase.title}
            label={labels.breadcrumb ?? page.title}
          />
        }
      />

      <Section tone="concrete">
        <Container>
          {labels.partnerAttribution ? (
            <p className="mb-12 max-w-(--container-measure) border-l-[3px] border-brand py-1 pl-5 text-base font-semibold wdth-body">
              <RichText text={labels.partnerAttribution} />
            </p>
          ) : null}

          <div className="grid gap-14 lg:grid-cols-2 lg:gap-12">
            <ListBlock id="context" heading={useCase.context.heading} items={useCase.context.items} />

            <section aria-labelledby="challenges-heading">
              <Heading level={2} size="h3" text={useCase.challenges.heading} id="challenges-heading" />
              <div className="mt-5 border-t border-asphalt">
                {useCase.challenges.items.map((item) => (
                  <div key={item.heading} className="border-b border-rule py-4">
                    <Heading level={3} size="h4" text={item.heading} />
                    <p className="mt-1.5 text-base text-steel-ink wdth-body text-pretty">
                      <RichText text={item.body} />
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </Container>
      </Section>

      <Section tone="paper" labelledBy="solution-heading">
        <Container>
          <Heading level={2} size="h2" text={useCase.solution.heading} id="solution-heading" />
          <p className="mt-6 max-w-[52rem] text-lg leading-relaxed text-asphalt wdth-body text-pretty">
            <RichText text={useCase.solution.intro} />
          </p>
          <ol className="mt-8 grid border-t border-l border-rule md:grid-cols-3">
            {useCase.solution.capabilities.map((capability, index) => (
              <li key={capability} className="border-r border-b border-rule bg-concrete p-5" data-anim="fade" data-delay={index * 60}>
                <span aria-hidden="true" className="eyebrow tabular text-xs! text-steel-ink">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-base leading-snug wdth-body text-pretty">
                  <RichText text={capability} />
                </p>
              </li>
            ))}
          </ol>

          <ResultsGrid
            heading={useCase.results.heading}
            groups={[{ id: "results", items: useCase.results.items }]}
            headingId="results-heading"
            headingLevel={2}
            className="mt-20"
          />
        </Container>
      </Section>

      <Section tone="concrete" labelledBy="impact-heading">
        <Container>
          <div className="max-w-[52rem]">
            <ListBlock
              id="impact"
              heading={useCase.impact.heading}
              intro={useCase.impact.intro}
              items={useCase.impact.items}
            />
          </div>
        </Container>
      </Section>

      <CtaBand heading={cta.heading} body={cta.body} ctas={cta.ctas} headingId="cta-use-case" />
    </>
  );
}
