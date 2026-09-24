import type { Metadata } from "next";
import Image from "next/image";

import { BackedByStrip } from "@/components/BackedByStrip";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CapabilityList } from "@/components/CapabilityList";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { Heading } from "@/components/Heading";
import { ProjectCard } from "@/components/ProjectCard";
import { RegistrationsBlock } from "@/components/RegistrationsBlock";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";

import {
  getPage,
  getProject,
  getSection,
  getService,
  getServices,
  getSite,
} from "@/lib/content";
import { buildServiceMetadata } from "@/lib/metadata";
import type { CtaSection } from "@/lib/content-types";

type ServicePageProps = { params: Promise<{ slug: string }> };

const servicesPage = getPage("services");
const projectsPage = getPage("projects");
const site = getSite();

export function generateStaticParams() {
  return getServices().map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildServiceMetadata(getService(slug), site);
}

/**
 * One template for all four divisions.
 *
 * Every division renders the same structure, so the energy page is complete
 * the moment its copy is confirmed — nothing is conditional on which division
 * this is. The only per-division branches are data-driven: a division shows a
 * photograph if it has one, a related-projects grid if it lists any, and a
 * registrations block if it declares registrations.
 */
export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getService(slug);

  const labels = servicesPage.labels ?? {};
  const backedBy = getSection(servicesPage, "backed-by", "linkCards");

  // A division may supply its own CTA by id; otherwise it uses the shared one.
  // This is how the energy page is addressed to procurement without the
  // template knowing anything about energy.
  const cta: CtaSection = servicesPage.sections.some(
    (section) => section.id === `cta-${service.slug}`,
  )
    ? getSection(servicesPage, `cta-${service.slug}`, "cta")
    : getSection(servicesPage, "cta-default", "cta");

  const sectorLabels = new Map(
    (getSection(projectsPage, "all-projects", "collection").facets ?? []).map((facet) => [
      facet.value,
      facet.label,
    ]),
  );

  const relatedProjects = service.relatedProjectSlugs.map((projectSlug) =>
    getProject(projectSlug),
  );

  // Registrations are declared per division but held canonically in site.json.
  const oilAndGas = site.registrations.find((group) => group.id === "oil-and-gas");
  const showRegistrations = Boolean(service.registrations?.length && oilAndGas);

  return (
    <>
      <Section tone="concrete">
        <Container>
          <Breadcrumbs
            trail={[{ label: servicesPage.title, href: "/services" }]}
            current={service.name}
            label={labels.breadcrumb ?? servicesPage.title}
          />

          <Heading level={1} text={service.name} className="mt-6" />

          <p className="mt-5 max-w-(--container-measure) text-lg text-steel-ink wdth-body">
            <RichText text={service.summary} />
          </p>
        </Container>
      </Section>

      {service.image ? (
        <div className="relative aspect-3/2 w-full bg-steel/10 md:aspect-16/6">
          <Image
            src={service.image.src}
            alt={service.image.alt}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>
      ) : null}

      <Section tone="concrete">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              {service.body.map((paragraph, index) => (
                <p key={index} className="mt-5 text-base wdth-body first:mt-0">
                  <RichText text={paragraph} />
                </p>
              ))}

              {showRegistrations && oilAndGas ? (
                <RegistrationsBlock
                  heading={oilAndGas.label}
                  items={oilAndGas.items}
                  headingId="registrations"
                  className="mt-10"
                />
              ) : null}
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              <CapabilityList
                items={service.capabilities}
                heading={labels.capabilities}
                headingId="capabilities"
                className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]"
              />
            </div>
          </div>
        </Container>
      </Section>

      {relatedProjects.length ? (
        <Section tone="white" labelledBy="related-projects">
          <Container>
            <Heading
              level={2}
              text={labels.relatedProjects ?? ""}
              id="related-projects"
              size="h2"
            />

            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((project) => (
                <li key={project.slug} className="contents">
                  <ProjectCard
                    project={project}
                    sectorLabel={sectorLabels.get(project.sector) ?? project.sector}
                  />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <Section tone="concrete" labelledBy="backed-by">
        <Container>
          <BackedByStrip
            heading={backedBy.heading}
            intro={backedBy.intro}
            items={backedBy.items}
            headingId="backed-by"
          />
        </Container>
      </Section>

      <CtaBand heading={cta.heading} body={cta.body} ctas={cta.ctas} headingId={`cta-${slug}`} />
    </>
  );
}
