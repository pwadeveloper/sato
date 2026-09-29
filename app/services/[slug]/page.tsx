import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";

import { BackedByStrip } from "@/components/BackedByStrip";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/Container";
import { DraftNotice } from "@/components/DraftNotice";
import { CtaBand } from "@/components/CtaBand";
import { Heading } from "@/components/Heading";
import { PageHeader } from "@/components/PageHeader";
import { PartnerDetails } from "@/components/PartnerExperience";
import { RelatedServices } from "@/components/RelatedServices";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { ServiceSections } from "@/components/ServiceSections";

import {
  getPage,
  getSection,
  getService,
  getServiceBands,
  getServiceNav,
  getServices,
  getSite,
} from "@/lib/content";
import { buildServiceMetadata } from "@/lib/metadata";
import { isReviewMode } from "@/lib/review-mode";
import type { CtaSection, Service } from "@/lib/content-types";

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
 * One template for every service, and one shape for every service page.
 *
 * Capabilities · Solutions · Partnerships, in that order, under a sticky
 * sub-nav, on all eight of them. The client's instruction after the review
 * call was that a reader who has learned the shape of the Oil & Gas page has
 * learned all of them — so what varies between services is how much sits in
 * each section, never which sections there are or what they are called.
 *
 * Nothing here branches on which service it is rendering. The sub-nav is
 * derived from the content by `getServiceNav()`: a section with nothing in it
 * produces no band, no `h2`, no `#id` anchor and no nav item, and Projects
 * appears in the nav only when a published project category names this
 * service — as a link out, because the work lives under Projects.
 *
 * The Oil & Gas sub-nav the client asked us to leave alone comes out of that
 * derivation unchanged: Capabilities · Solutions · Projects (to
 * `/projects/oil-gas`) · Partnerships.
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

  const relatedServices = (service.relatedServiceSlugs ?? []).map((related) =>
    getService(related),
  );

  // Registrations are declared per service but held canonically in site.json.
  const oilAndGas = site.registrations.find((group) => group.id === "oil-and-gas");
  const registrations =
    service.registrations?.length && oilAndGas
      ? { heading: oilAndGas.label, items: oilAndGas.items }
      : undefined;

  // The service's own category, for the breadcrumb trail.
  const band = getServiceBands().find((entry) => entry.group === service.group);
  const trail = [{ label: servicesPage.title, href: "/services" }];
  if (band?.href) trail.push({ label: band.label, href: band.href });

  const nav = getServiceNav(service);

  const above = (
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
  );

  return (
    <>
      {service.headerOverlay && service.image ? (
        <OverlayHeader service={service} above={above} />
      ) : (
        <PageHeader
          title={service.name}
          intro={[service.summary]}
          image={service.image}
          headingId="service-heading"
          above={above}
        />
      )}

      <ServiceSections
        content={service.sections}
        nav={nav}
        labels={labels}
        gallery={service.images ?? []}
        registrations={registrations}
        footers={{
          partnerships: (
            <>
              {service.partner ? (
                <PartnerDetails
                  partner={service.partner}
                  headingId="partner-details"
                  className="mt-6"
                />
              ) : null}

              {relatedServices.length ? (
                <RelatedServices
                  heading={labels.relatedServices ?? ""}
                  headingId="related-services"
                  services={relatedServices}
                  className="mt-12"
                />
              ) : null}
            </>
          ),
        }}
      />

      <Section tone="white" labelledBy="backed-by">
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

/**
 * The header for a service whose artwork can carry the copy over it.
 *
 * Only Oil & Gas declares `headerOverlay`, and only because its illustration
 * is drawn with an empty arc on the left for exactly this. Every other page
 * on the site sets its `h1` on the page background with the photograph in a
 * band beneath, because text over a photograph has to be won at each
 * breakpoint and on a header repeated across fifteen pages that fight gets
 * lost somewhere.
 */
function OverlayHeader({
  service,
  above,
}: {
  service: Service;
  above: ReactNode;
}) {
  if (!service.image) return null;

  return (
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
          Two scrims, because the copy sits in two different places. From
          `md` up it occupies the left column and a horizontal wash covers
          exactly that, leaving the platforms on the right untouched. On a
          phone the copy runs the full width, the green reaches under it, and
          asphalt on that measures 4.2:1 — under AA. So small screens get a
          flat wash instead, heavy enough to clear 8:1 and light enough to
          keep the photograph.
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
            {above}
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
  );
}
