import type { Metadata } from "next";

import { BackedByStrip } from "@/components/BackedByStrip";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { Heading } from "@/components/Heading";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { TextLink } from "@/components/TextLink";

import { getPage, getSection, getService, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("infrastructure");
const servicesPage = getPage("services");
const site = getSite();

const intro = getSection(page, "intro", "prose");
const disciplines = getSection(page, "disciplines", "collection");
const cta = getSection(page, "cta", "cta");
const backedBy = getSection(servicesPage, "backed-by", "linkCards");

const services = (disciplines.slugs ?? []).map((slug) => getService(slug));
const labels = page.labels ?? {};

export const metadata: Metadata = buildPageMetadata(page, site);

/**
 * The Infrastructure Services landing page.
 *
 * A category page rather than a ninth service: the four disciplines below
 * keep their own detail pages and routes, and this page exists so a reader
 * coming from the nav or a letter sees the whole established practice in one
 * place before choosing where to go. Each discipline shows its summary and
 * the first few capabilities — enough to recognise the right one, not enough
 * to duplicate the detail page.
 */
const CAPABILITY_PREVIEW = 5;

export default function InfrastructurePage() {
  return (
    <>
      <Section tone="concrete">
        <Container>
          <Breadcrumbs
            trail={[{ label: servicesPage.title, href: "/services" }]}
            current={page.title}
            label={labels.breadcrumb ?? servicesPage.title}
          />

          <Heading level={1} text={page.title} className="mt-6" />

          <div className="mt-5 flex max-w-(--container-measure) flex-col gap-5">
            {intro.body.map((paragraph, index) => (
              <p
                key={index}
                className={
                  index === 0
                    ? "text-lg text-asphalt wdth-body text-pretty"
                    : "text-base text-steel-ink wdth-body text-pretty"
                }
              >
                <RichText text={paragraph} />
              </p>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <div className="flex flex-col gap-14 md:gap-20">
            {services.map((service) => (
              <section
                key={service.slug}
                aria-labelledby={`discipline-${service.slug}`}
                className="lg:grid lg:grid-cols-12 lg:gap-x-12"
              >
                <div className="border-t-[3px] border-brand pt-5 lg:col-span-5">
                  <h2
                    id={`discipline-${service.slug}`}
                    className="text-h3 wdth-heading text-balance"
                  >
                    <RichText text={service.name} />
                  </h2>
                  <p className="mt-3 max-w-(--container-measure) text-base text-steel-ink wdth-body text-pretty">
                    <RichText text={service.summary} />
                  </p>
                  <p className="mt-4">
                    <TextLink
                      label={labels.viewService ?? service.name}
                      href={`/services/${service.slug}`}
                    />
                  </p>
                </div>

                <div className="mt-6 lg:col-span-6 lg:col-start-7 lg:mt-0 lg:pt-5">
                  <h3 className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body">
                    <RichText text={labels.capabilities ?? ""} />
                  </h3>
                  <ul className="mt-3 border-t border-asphalt">
                    {service.capabilities
                      .slice(0, CAPABILITY_PREVIEW)
                      .map((capability) => (
                        <li
                          key={capability}
                          className="border-b border-rule py-2.5 text-base wdth-body"
                        >
                          <RichText text={capability} />
                        </li>
                      ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>
        </Container>
      </Section>

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
        headingId="infrastructure-cta"
      />
    </>
  );
}
