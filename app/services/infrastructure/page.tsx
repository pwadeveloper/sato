import type { Metadata } from "next";

import { BackedByStrip } from "@/components/BackedByStrip";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { DraftNotice } from "@/components/DraftNotice";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { ServiceSections } from "@/components/ServiceSections";

import { getPage, getSection, getServiceSections, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { isReviewMode } from "@/lib/review-mode";

const page = getPage("infrastructure");
const servicesPage = getPage("services");
const site = getSite();

const intro = getSection(page, "intro", "prose");
const cta = getSection(page, "cta", "cta");
const backedBy = getSection(servicesPage, "backed-by", "linkCards");

const labels = { ...(servicesPage.labels ?? {}), ...(page.labels ?? {}) };

export const metadata: Metadata = buildPageMetadata(page, site);

/**
 * The Infrastructure Services landing page.
 *
 * A category page rather than a ninth service — the four disciplines keep
 * their own routes — but it reads as a service page, because a visitor
 * arriving from the nav does not know the difference and should not have to
 * learn a second page shape. So it renders the same three sections through
 * the same components as `/services/[slug]`, out of `page.serviceSections`.
 *
 * Capabilities is the four infrastructure types, each with a photograph, a
 * short description and a link on to its own page. Solutions is what cuts
 * across them. Partnerships is empty, and therefore absent: Sato has no
 * technical partner in infrastructure to name, and the client's line is that
 * a Partnerships section names partners, never clients or funders.
 */
export default function InfrastructurePage() {
  const content = page.serviceSections ?? {};
  const nav = getServiceSections(content, "infrastructure");

  return (
    <>
      <PageHeader
        title={page.title}
        intro={intro.body}
        image={page.images?.header}
        headingId="infrastructure-heading"
        above={
          <>
            <Breadcrumbs
              trail={[{ label: servicesPage.title, href: "/services" }]}
              current={page.title}
              label={labels.breadcrumb ?? servicesPage.title}
            />
            {isReviewMode && page.reviewStatus === "draft" ? (
              <DraftNotice className="mt-6" />
            ) : null}
          </>
        }
      />

      <ServiceSections content={content} nav={nav} labels={labels} />

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
        headingId="infrastructure-cta"
      />
    </>
  );
}
