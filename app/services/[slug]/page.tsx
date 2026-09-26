import type { Metadata } from "next";
import Image from "next/image";

import { BackedByStrip } from "@/components/BackedByStrip";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CapabilityBlocks } from "@/components/CapabilityBlocks";
import { CapabilityList } from "@/components/CapabilityList";
import { Container } from "@/components/Container";
import { DraftNotice } from "@/components/DraftNotice";
import { CtaBand } from "@/components/CtaBand";
import { Heading } from "@/components/Heading";
import { PartnerExperience } from "@/components/PartnerExperience";
import { ProcurementList } from "@/components/ProcurementList";
import { ProjectCard } from "@/components/ProjectCard";
import { RegistrationsBlock } from "@/components/RegistrationsBlock";
import { RelatedServices } from "@/components/RelatedServices";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { ServiceListBlock } from "@/components/ServiceListBlock";

import {
  flattenFacets,
  getPage,
  getProject,
  getSection,
  getService,
  getServiceBands,
  getServices,
  getSite,
} from "@/lib/content";
import { buildServiceMetadata } from "@/lib/metadata";
import { isReviewMode } from "@/lib/review-mode";
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
 * One template for every service.
 *
 * Nothing branches on which service this is. The richer blocks — grouped
 * capabilities, named solutions, equipment procurement, a partner's track
 * record — are all optional fields on the service, so the oil and gas page is
 * long because its content is long, and the water page is short for the same
 * reason. Adding any of those blocks to another service is a content edit.
 */
export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getService(slug);

  const labels = servicesPage.labels ?? {};
  const backedBy = getSection(servicesPage, "backed-by", "linkCards");

  // A service may supply its own CTA by id; otherwise it uses the shared one.
  // This is how the oil and gas page is addressed to operators without the
  // template knowing anything about oil and gas.
  const cta: CtaSection = servicesPage.sections.some(
    (section) => section.id === `cta-${service.slug}`,
  )
    ? getSection(servicesPage, `cta-${service.slug}`, "cta")
    : getSection(servicesPage, "cta-default", "cta");

  const sectorLabels = new Map(
    flattenFacets(
      getSection(projectsPage, "all-projects", "collection").facets ?? [],
    ).map((facet) => [facet.value, facet.label]),
  );

  const relatedProjects = service.relatedProjectSlugs.map((projectSlug) =>
    getProject(projectSlug),
  );

  const relatedServices = (service.relatedServiceSlugs ?? []).map((related) =>
    getService(related),
  );

  // Registrations are declared per service but held canonically in site.json.
  const oilAndGas = site.registrations.find((group) => group.id === "oil-and-gas");
  const showRegistrations = Boolean(service.registrations?.length && oilAndGas);

  // Grouped capabilities replace the flat sidebar list rather than joining it.
  const blocks = service.capabilityBlocks ?? [];
  const hasBlocks = blocks.length > 0;

  // The service's own category, for the breadcrumb trail.
  const band = getServiceBands().find((entry) => entry.group === service.group);
  const trail = [{ label: servicesPage.title, href: "/services" }];
  if (band?.href) trail.push({ label: band.label, href: band.href });

  return (
    <>
      <Section tone="concrete">
        <Container>
          <Breadcrumbs
            trail={trail}
            current={service.name}
            label={labels.breadcrumb ?? servicesPage.title}
          />

          <Heading level={1} text={service.name} className="mt-6" />

          {isReviewMode && service.reviewStatus === "draft" ? (
            <DraftNotice className="mt-6" />
          ) : null}

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
            <div className={hasBlocks ? "lg:col-span-8" : "lg:col-span-7"}>
              {service.body.map((paragraph, index) => (
                <p key={index} className="mt-5 text-base wdth-body first:mt-0">
                  <RichText text={paragraph} />
                </p>
              ))}

              {hasBlocks ? (
                <CapabilityBlocks
                  blocks={blocks}
                  heading={labels.capabilities}
                  headingId="capabilities"
                  className="mt-12"
                />
              ) : null}

              {showRegistrations && oilAndGas ? (
                <RegistrationsBlock
                  heading={oilAndGas.label}
                  items={oilAndGas.items}
                  headingId="registrations"
                  className="mt-10"
                />
              ) : null}
            </div>

            {hasBlocks ? null : (
              <div className="lg:col-span-4 lg:col-start-9">
                <CapabilityList
                  items={service.capabilities}
                  heading={labels.capabilities}
                  headingId="capabilities"
                  className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]"
                />
              </div>
            )}
          </div>

          {service.solutions || service.alsoCovered ? (
            <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-8">
              {service.solutions ? (
                <div className="lg:col-span-7">
                  <ServiceListBlock
                    list={service.solutions}
                    headingId="solutions"
                    variant="dense"
                  />
                </div>
              ) : null}
              {service.alsoCovered ? (
                <div className="lg:col-span-4 lg:col-start-9">
                  <ServiceListBlock list={service.alsoCovered} headingId="also-covered" />
                </div>
              ) : null}
            </div>
          ) : null}

          {relatedServices.length ? (
            <RelatedServices
              heading={labels.relatedServices ?? ""}
              headingId="related-services"
              services={relatedServices}
              className="mt-14"
            />
          ) : null}
        </Container>
      </Section>

      {service.procurement ? (
        <Section tone="white" labelledBy="procurement">
          <Container>
            <ProcurementList block={service.procurement} headingId="procurement" />
          </Container>
        </Section>
      ) : null}

      {service.partner ? (
        <Section tone="concrete" labelledBy="partner-experience">
          <Container>
            <PartnerExperience
              partner={service.partner}
              headingId="partner-experience"
            />
          </Container>
        </Section>
      ) : null}

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

      <CtaBand
        heading={cta.heading}
        body={cta.body}
        ctas={cta.ctas}
        headingId={`cta-${slug}`}
      />
    </>
  );
}
