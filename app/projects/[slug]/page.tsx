import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CapabilityList } from "@/components/CapabilityList";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { Heading } from "@/components/Heading";
import { ProjectGallery } from "@/components/ProjectGallery";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { Tag } from "@/components/Tag";

import {
  getPage,
  getProject,
  getProjects,
  getSection,
  getServiceForProject,
  getSite,
  isCompleted,
} from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { isKnown } from "@/lib/placeholders";
import { cn } from "@/lib/cn";
import type { Service } from "@/lib/content-types";

type ProjectPageProps = { params: Promise<{ slug: string }> };

const page = getPage("projects");
const site = getSite();
const labels = page.labels ?? {};
const all = getSection(page, "all-projects", "collection");
const cta = getSection(page, "cta-default", "cta");
const facets = all.facets ?? [];

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  return buildPageMetadata(
    {
      ...page,
      slug: `projects/${project.slug}`,
      title: project.title,
      metaTitle: project.title,
      metaDescription: isKnown(project.summary)
        ? project.summary
        : page.metaDescription,
      ogImage: project.images[0] ?? page.ogImage,
    },
    site,
  );
}


/**
 * The project record: confirmed facts, then the division that owns the work.
 *
 * `row` lays the facts across the page for a project with no photographs,
 * where the block carries the page on its own; the default stacks them into
 * the sidebar beside a gallery.
 */
function ProjectFacts({
  facts,
  heading,
  service,
  serviceLabel,
  layout = "stack",
}: {
  facts: Array<{ label: string; value: string }>;
  heading: string;
  service: Service | undefined;
  serviceLabel: string;
  layout?: "stack" | "row";
}) {
  const isRow = layout === "row";

  return (
    <>
      {facts.length ? (
        <>
          <h2
            id="project-details"
            className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body"
          >
            <RichText text={heading} />
          </h2>

          <dl
            className={cn(
              "mt-4 border-t border-asphalt",
              isRow && "grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {facts.map((fact) => (
              <div key={fact.label} className="border-b border-rule py-4">
                <dt className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel wdth-body">
                  <RichText text={fact.label} />
                </dt>
                <dd className="mt-1 text-base wdth-body">
                  <RichText text={fact.value} />
                </dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}

      {service ? (
        <div className="mt-8">
          <h2 className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body">
            <RichText text={serviceLabel} />
          </h2>
          <Link
            href={`/services/${service.slug}`}
            className="mt-3 inline-block text-h3 wdth-heading text-balance text-brand-ink underline underline-offset-[0.2em] decoration-1 decoration-brand-ink/40 transition-colors duration-150 hover:text-brand-deep hover:decoration-brand-deep"
          >
            <RichText text={service.name} />
          </Link>
        </div>
      ) : null}
    </>
  );
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  const sectorLabel =
    facets.find((facet) => facet.value === project.sector)?.label ?? project.sector;
  const service = getServiceForProject(project, facets);

  /**
   * Only facts the company has actually confirmed. A field that is nothing but
   * a `{{CONFIRM: ...}}` is dropped rather than printed, so the plate reads as
   * a record instead of a list of gaps — and the placeholder stays in the JSON
   * where the content pass will find it.
   */
  const facts: Array<{ label: string; value: string }> = [
    { label: labels.client ?? "", value: project.client },
    { label: labels.location ?? "", value: project.location },
    { label: labels.year ?? "", value: project.year },
  ].filter((fact) => isKnown(fact.value));

  const hasImages = project.images.length > 0;

  return (
    <>
      <Section tone="concrete">
        <Container>
          <Breadcrumbs
            trail={[{ label: page.title, href: "/projects" }]}
            current={project.title}
            label={labels.breadcrumb ?? page.title}
          />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Tag label={sectorLabel} />
            {isCompleted(project.status) ? (
              <span className="inline-flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.06em] text-brand-ink wdth-body">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
                <RichText text={project.status} />
              </span>
            ) : null}
          </div>

          <Heading level={1} text={project.title} className="mt-4" />

          {isKnown(project.summary) ? (
            <p className="mt-5 max-w-(--container-measure) text-lg text-steel-ink wdth-body">
              <RichText text={project.summary} />
            </p>
          ) : null}
        </Container>
      </Section>

      <Section tone="concrete" as="div" className="pt-0">
        <Container>
          {hasImages ? (
            /* With photographs: gallery on the measure, record alongside it. */
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-7">
                <ProjectGallery
                  images={project.images}
                  label={labels.gallery ?? ""}
                  thumbsLabel={labels.galleryThumbs ?? ""}
                />

                {project.scope.length ? (
                  <div className="mt-10">
                    <CapabilityList
                      items={project.scope}
                      heading={labels.scope}
                      headingId="scope"
                    />
                  </div>
                ) : null}
              </div>

              <div className="lg:col-span-4 lg:col-start-9">
                <ProjectFacts
                  facts={facts}
                  heading={labels.details ?? ""}
                  service={service}
                  serviceLabel={labels.relatedService ?? ""}
                />
              </div>
            </div>
          ) : (
            /* No photographs. Rather than leave a hole where the gallery would
               be, the record itself becomes the page: the facts run across the
               full width as a plate, with the scope beneath. Clean, and it
               never looks like an image failed to load. */
            <div className="border-t-[3px] border-brand-deep bg-white px-6 py-10 md:px-10 md:py-12">
              <ProjectFacts
                facts={facts}
                heading={labels.details ?? ""}
                service={service}
                serviceLabel={labels.relatedService ?? ""}
                layout="row"
              />

              {project.scope.length ? (
                <div className="mt-10 max-w-(--container-measure)">
                  <CapabilityList
                    items={project.scope}
                    heading={labels.scope}
                    headingId="scope"
                  />
                </div>
              ) : null}
            </div>
          )}
        </Container>
      </Section>

      <CtaBand
        heading={cta.heading}
        body={cta.body}
        ctas={cta.ctas}
        headingId={`cta-${project.slug}`}
      />
    </>
  );
}
