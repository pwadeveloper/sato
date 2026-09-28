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
import { PageHeader } from "@/components/PageHeader";
import {
  PartnerExperience,
  PartnerRecognition,
} from "@/components/PartnerExperience";
import { ProcurementList } from "@/components/ProcurementList";
import { RegistrationsBlock } from "@/components/RegistrationsBlock";
import { RelatedServices } from "@/components/RelatedServices";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { SectionNav } from "@/components/SectionNav";
import { ServiceListBlock } from "@/components/ServiceListBlock";
import { SolutionsPyramid } from "@/components/SolutionsPyramid";
import { TextLink } from "@/components/TextLink";
import { ValueMap } from "@/components/ValueMap";

import {
  getPage,
  getProjectCategories,
  getSection,
  getService,
  getServiceBands,
  getServices,
  getSite,
} from "@/lib/content";
import { buildServiceMetadata } from "@/lib/metadata";
import { isReviewMode } from "@/lib/review-mode";
import type { CollectionFacet, CtaSection } from "@/lib/content-types";
import { cn } from "@/lib/cn";

type ServicePageProps = { params: Promise<{ slug: string }> };

const servicesPage = getPage("services");
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
 * capabilities, named solutions, diagrams, equipment procurement, a
 * partner's track record — are all optional fields on the service, so the
 * oil and gas page is long because its content is long, and the water page
 * is short for the same reason.
 *
 * `sectionNav` is the same idea applied to shape rather than to blocks. A
 * service that declares sections gets them: an anchored run of four, a
 * sticky sub-nav, and its sub-headings dropped a level to sit under them. A
 * service that declares none renders as one continuous page, as before.
 * Which service that happens to be is still not the template's business.
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

  // Projects live under Projects, not under Services. A service links out to
  // the categories that hold its work — there may be none (Energy, Digital
  // Twin and Research have no category yet, and show no link) or more than
  // one (Civil Engineering & Construction holds both Buildings and Roads).
  const projectCategories = getProjectCategories().filter(
    (category) => category.serviceSlug === service.slug,
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

  const sections = service.sectionNav ?? [];
  const sectioned = sections.length > 0;

  const header = (
    <PageHeader
      title={service.name}
      intro={[service.summary]}
      image={sectioned ? null : service.image}
      headingId="service-heading"
      above={
        <>
          <Breadcrumbs
            trail={trail}
            current={service.name}
            label={labels.breadcrumb ?? servicesPage.title}
          />
          {isReviewMode && service.reviewStatus === "draft" ? (
            <DraftNotice className="mt-6" />
          ) : null}
        </>
      }
    />
  );

  /* ------------------------------------------------------- page body parts */

  const bodyProse = service.body.map((paragraph, index) => (
    <p
      key={index}
      className="mt-5 max-w-(--container-measure) text-base wdth-body first:mt-0"
    >
      <RichText text={paragraph} />
    </p>
  ));

  if (!sectioned) {
    return (
      <>
        {header}

        <Section tone="concrete">
          <Container>
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
              <div className={hasBlocks ? "lg:col-span-8" : "lg:col-span-7"}>
                {bodyProse}

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

            <CategoryProjectLinks
              categories={projectCategories}
              label={labels.projectsLink ?? ""}
              className="mt-14"
            />
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

  /* ------------------------------------------------------ sectioned layout */

  const partner = service.partner;
  const sectionLabel = (id: string) =>
    sections.find((section) => section.id === id)?.label ?? id;

  return (
    <>
      {/*
        This page sets its heading over the photograph rather than under it.
        The artwork is drawn with an empty arc on the left for exactly that,
        and a scrim holds the contrast wherever the crop lands.
      */}
      {service.image ? (
        <div className="relative isolate bg-concrete">
          <div className="absolute inset-0 -z-10">
            <Image
              src={service.image.src}
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover object-right"
            />
            {/*
              Two scrims, because the copy sits in two different places.
              From `md` up it occupies the left column and a horizontal wash
              covers exactly that, leaving the platforms on the right
              untouched. On a phone the copy runs the full width, the green
              reaches under it, and asphalt on that measures 4.2:1 — under
              AA. So small screens get a flat wash instead, heavy enough to
              clear 8:1 and light enough to keep the photograph.
            */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-concrete/72 md:hidden"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 hidden md:block md:bg-[linear-gradient(to_right,var(--color-concrete)_0%,color-mix(in_srgb,var(--color-concrete)_88%,transparent)_38%,color-mix(in_srgb,var(--color-concrete)_40%,transparent)_70%,transparent_100%)]"
            />
          </div>

          <Section tone="concrete" as="div" className="bg-transparent!">
            <Container>
              <div className="max-w-[34rem]">
                <Breadcrumbs
                  trail={trail}
                  current={service.name}
                  label={labels.breadcrumb ?? servicesPage.title}
                />
                {isReviewMode && service.reviewStatus === "draft" ? (
                  <DraftNotice className="mt-6" />
                ) : null}
                <Heading
                  level={1}
                  text={service.name}
                  id="service-heading"
                  className="mt-6"
                />
                <p className="mt-5 text-lg text-asphalt wdth-body text-pretty">
                  <RichText text={service.summary} />
                </p>
              </div>
            </Container>
          </Section>
        </div>
      ) : (
        header
      )}

      <SectionNav sections={sections} label={labels.sectionNav ?? service.name} />

      {/* ------------------------------------------------------ capabilities */}
      <Section tone="concrete" id="capabilities" labelledBy="capabilities-heading">
        <Container>
          <Heading
            level={2}
            text={sectionLabel("capabilities")}
            id="capabilities-heading"
            size="h2"
          />

          <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              {bodyProse}

              {hasBlocks ? (
                <CapabilityBlocks blocks={blocks} className="mt-10" />
              ) : (
                <CapabilityList
                  items={service.capabilities}
                  className="mt-10"
                />
              )}
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              {service.alsoCovered ? (
                <ServiceListBlock
                  list={service.alsoCovered}
                  headingId="also-covered"
                  headingLevel={3}
                />
              ) : null}

              {showRegistrations && oilAndGas ? (
                <RegistrationsBlock
                  heading={oilAndGas.label}
                  items={oilAndGas.items}
                  headingId="registrations"
                  headingLevel={3}
                  className="mt-10"
                />
              ) : null}
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- solutions */}
      <Section tone="white" id="solutions" labelledBy="solutions-heading">
        <Container>
          <Heading
            level={2}
            text={sectionLabel("solutions")}
            id="solutions-heading"
            size="h2"
          />

          <div className="mt-8 flex flex-col gap-14">
            {service.solutions ? (
              <ServiceListBlock
                list={service.solutions}
                headingId="solutions-list"
                headingLevel={3}
                variant="dense"
              />
            ) : null}

            {service.solutionsPyramid ? (
              <SolutionsPyramid
                pyramid={service.solutionsPyramid}
                headingId="solutions-pyramid"
                headingLevel={3}
              />
            ) : null}

            {service.valueMap ? (
              <ValueMap
                map={service.valueMap}
                headingId="value-map"
                headingLevel={3}
              />
            ) : null}

            {service.procurement ? (
              <ProcurementList
                block={service.procurement}
                headingId="procurement"
                headingLevel={3}
              />
            ) : null}
          </div>
        </Container>
      </Section>

      {/* ----------------------------------------------------------- projects */}
      {/*
        The record itself moved to /projects/oil-gas, with the rest of the
        project categories. The anchor stays so an existing `#projects` link
        still lands on something — it finds this block and the link on to the
        table, rather than a heading over nothing.
      */}
      {projectCategories.length ? (
        <Section tone="concrete" id="projects" labelledBy="projects-heading">
          <Container>
            <Heading
              level={2}
              text={sectionLabel("projects")}
              id="projects-heading"
              size="h2"
            />

            <CategoryProjectLinks
              categories={projectCategories}
              label={labels.projectsLink ?? ""}
              intro={projectCategories[0]?.intro}
              className="mt-6"
            />
          </Container>
        </Section>
      ) : null}

      {/* ------------------------------------------------------- partnerships */}
      {partner ? (
        <Section tone="white" id="partnerships" labelledBy="partnerships-heading">
          <Container>
            <Heading
              level={2}
              text={sectionLabel("partnerships")}
              id="partnerships-heading"
              size="h2"
            />

            <p className="mt-6 max-w-(--container-measure) text-lg text-steel-ink wdth-body text-pretty">
              <RichText text={partner.intro} />
            </p>

            {partner.name ? (
              <p className="mt-4 max-w-(--container-measure) border-l-[3px] border-brand py-1 pl-5 text-base wdth-body">
                <span className="font-bold">
                  <RichText text={partner.nameLabel} />
                  {": "}
                </span>
                <RichText text={partner.name} />
              </p>
            ) : null}

            <PartnerRecognition
              partner={partner}
              headingId="partner-experience"
              headingLevel={3}
              className="mt-10 max-w-(--container-measure)"
            />

            {relatedServices.length ? (
              <RelatedServices
                heading={labels.relatedServices ?? ""}
                headingId="related-services"
                services={relatedServices}
                className="mt-12"
              />
            ) : null}
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

/**
 * "See our Buildings & Construction projects" — one link per category.
 *
 * A service used to list project cards. Every project now lives under
 * Projects, so a service points at the category instead: one link, at the
 * foot of the page, going to the place that holds the whole record rather
 * than to a sample of it.
 */
function CategoryProjectLinks({
  categories,
  label,
  intro,
  className,
}: {
  categories: CollectionFacet[];
  label: string;
  intro?: string;
  className?: string;
}) {
  if (!categories.length || !label) return null;

  return (
    <div className={cn(className)}>
      {intro ? (
        <p className="max-w-(--container-measure) text-base text-steel-ink wdth-body text-pretty">
          <RichText text={intro} />
        </p>
      ) : null}

      <ul className={cn("flex flex-col gap-2", intro && "mt-5")}>
        {categories.map((category) => (
          <li key={category.value}>
            <TextLink
              label={label.replace("{category}", category.label)}
              href={`/projects/${category.slug}`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
