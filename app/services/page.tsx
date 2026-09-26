import type { Metadata } from "next";
import Link from "next/link";

import { BackedByStrip } from "@/components/BackedByStrip";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { Heading } from "@/components/Heading";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { ServiceCard } from "@/components/ServiceCard";
import { TextLink } from "@/components/TextLink";

import { getPage, getSection, getServiceBands, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { bandHref, bandItems } from "@/lib/service-band";

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
  const bands = getServiceBands();

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
        Four categories, not eight equal cards. The grouping is the
        information: it tells a reader which disciplines Sato has delivered
        with for decades and which are newer, without ranking them on the page.
        A category holding one service renders that service directly, so
        "Energy Services" is never a heading over a single card repeating it.
      */}
      {bands.map((band) => {
        const categoryHref = bandHref(band);
        const items = bandItems(band);
        const solo = items.length === 0 ? band.services[0] : undefined;

        return (
          <Section
            key={band.group}
            tone="concrete"
            className="pt-0!"
            labelledBy={`band-${band.group}`}
          >
            <Container>
              <div className="border-t-[3px] border-brand-bright pt-6">
                <h2
                  id={`band-${band.group}`}
                  className="text-h3 wdth-heading text-asphalt"
                >
                  {/* Linked only where the category has a landing page; a
                      category of one is reached through the link below it. */}
                  {categoryHref ? (
                    <Link
                      href={categoryHref}
                      className="group no-underline transition-colors duration-150 hover:text-brand-ink"
                    >
                      <RichText text={band.label} />
                      <span
                        aria-hidden="true"
                        className="ml-3 inline-block text-[0.7em] text-steel transition-colors duration-150 group-hover:text-brand"
                      >
                        &rarr;
                      </span>
                    </Link>
                  ) : (
                    <RichText text={band.label} />
                  )}
                </h2>
                {/* A category of one repeats itself if it shows both its own
                    intro and the service summary below, so it shows only the
                    summary — the more specific of the two. */}
                {band.intro && !solo ? (
                  <p className="mt-2 max-w-(--container-measure) text-base text-steel-ink wdth-body">
                    <RichText text={band.intro} />
                  </p>
                ) : null}
              </div>

              {solo ? (
                <div className="mt-6 max-w-(--container-measure)">
                  <p className="text-lg text-asphalt wdth-body text-pretty">
                    <RichText text={solo.summary} />
                  </p>
                  <p className="mt-4">
                    <TextLink
                      label={labels.viewService ?? solo.name}
                      href={`/services/${solo.slug}`}
                    />
                  </p>
                </div>
              ) : (
                <ul className="mt-8 grid gap-6 md:grid-cols-2">
                  {items.map((service) => (
                    <li key={service.slug} className="flex">
                      <ServiceCard
                        service={service}
                        variant="compact"
                        headingLevel={3}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Container>
          </Section>
        );
      })}

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
