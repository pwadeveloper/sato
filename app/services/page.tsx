import type { Metadata } from "next";

import { BackedByStrip } from "@/components/BackedByStrip";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { Heading } from "@/components/Heading";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { ServiceCard } from "@/components/ServiceCard";

import { getPage, getSection, getServices, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("services");
const site = getSite();

export const metadata: Metadata = buildPageMetadata(page, site);

export default function ServicesPage() {
  const services = getServices();
  const bySlug = new Map(services.map((service) => [service.slug, service]));

  const intro = getSection(page, "intro", "prose");
  const primary = getSection(page, "divisions-primary", "collection");
  const secondary = getSection(page, "divisions-secondary", "collection");
  const backedBy = getSection(page, "backed-by", "linkCards");
  const cta = getSection(page, "cta-default", "cta");

  const pick = (slugs: string[] | undefined) =>
    (slugs ?? []).map((slug) => bySlug.get(slug)).filter((s): s is NonNullable<typeof s> => !!s);

  const primaryServices = pick(primary.slugs);
  const secondaryServices = pick(secondary.slugs);

  return (
    <>
      <Section tone="concrete">
        <Container>
          <Heading level={1} text={page.title} />
          {intro.body.map((paragraph, index) => (
            <p
              key={index}
              className="mt-5 max-w-(--container-measure) text-lg text-steel-ink wdth-body"
            >
              <RichText text={paragraph} />
            </p>
          ))}
        </Container>
      </Section>

      {/*
        Hierarchy rather than four equal cards: the established divisions get
        photography and the larger heading; the two whose content is still being
        confirmed sit below on a tighter row, so the page does not present four
        divisions as equally evidenced when two of them are still placeholders.
      */}
      <Section tone="concrete" className="pt-0!" aria-label={page.title}>
        <Container>
          <ul className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            {primaryServices.map((service, index) => (
              <li key={service.slug} className="contents">
                <ServiceCard
                  service={service}
                  variant="featured"
                  headingLevel={2}
                  priority={index === 0}
                />
              </li>
            ))}
          </ul>

          <ul className="mt-6 grid gap-6 border-t border-asphalt pt-6 lg:mt-8 lg:grid-cols-2 lg:gap-8 lg:pt-8">
            {secondaryServices.map((service) => (
              <li key={service.slug} className="contents">
                <ServiceCard service={service} variant="compact" headingLevel={2} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

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

      <CtaBand body={cta.body} ctas={cta.ctas} />
    </>
  );
}
