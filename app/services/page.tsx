import type { Metadata } from "next";

import { BackedByStrip } from "@/components/BackedByStrip";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { Heading } from "@/components/Heading";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { ServiceCard } from "@/components/ServiceCard";

import { getPage, getSection, getServiceGroups, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("services");
const site = getSite();

export const metadata: Metadata = buildPageMetadata(page, site);

export default function ServicesPage() {
  const intro = getSection(page, "intro", "prose");
  // Read so the page fails loudly if the content section is renamed.
  getSection(page, "divisions", "collection");
  const backedBy = getSection(page, "backed-by", "linkCards");
  const cta = getSection(page, "cta-default", "cta");

  const labels = page.labels ?? {};
  const bands = getServiceGroups();
  const key = (group: string) => `group${group[0].toUpperCase()}${group.slice(1)}`;

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
        Three bands, not eight equal cards. The grouping is the information: it
        tells a reader which disciplines Sato has delivered with for decades and
        which are newer, without ranking them against each other on the page.
      */}
      {bands.map((band) => (
        <Section
          key={band.group}
          tone="concrete"
          className="pt-0!"
          labelledBy={`band-${band.group}`}
        >
          <Container>
            <div className="border-t-[3px] border-brand pt-6">
              <h2 id={`band-${band.group}`} className="text-h3 wdth-heading text-asphalt">
                <RichText text={labels[key(band.group)] ?? band.group} />
              </h2>
              {labels[`${key(band.group)}Intro`] ? (
                <p className="mt-2 max-w-(--container-measure) text-base text-steel-ink wdth-body">
                  <RichText text={labels[`${key(band.group)}Intro`]} />
                </p>
              ) : null}
            </div>

            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              {band.services.map((service) => (
                <li key={service.slug} className="flex">
                  <ServiceCard service={service} variant="compact" headingLevel={3} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ))}

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
