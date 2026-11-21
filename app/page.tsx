import type { Metadata } from "next";
import Image from "next/image";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { Heading } from "@/components/Heading";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { StatStrip } from "@/components/StatStrip";
import { StatementPair } from "@/components/StatementPair";
import { UseCaseCard } from "@/components/UseCaseCard";
import { HomePillars, type Pillar } from "@/components/home/HomePillars";

import {
  getFeaturedResults,
  getPage,
  getProjects,
  getSection,
  getService,
  getServiceBands,
  getServiceNav,
  getSite,
  getUseCases,
  getYearsInOperation,
} from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { bandHref, bandItems } from "@/lib/service-band";

const page = getPage("home");
const site = getSite();
const labels = page.labels ?? {};

const hero = getSection(page, "hero", "hero");
const welcome = getSection(page, "welcome", "prose");
const motto = getSection(page, "motto", "prose");
const whatWeDo = getSection(page, "what-we-do", "collection");
const facts = getSection(page, "facts", "facts");
// Held in the content whether or not it is shown — see `homeShowMissionVision`.
const mission = getSection(page, "mission", "prose");
const vision = getSection(page, "vision", "prose");
const cta = getSection(page, "cta", "cta");

const heroImage = hero.image ?? page.images?.hero;

export const metadata: Metadata = {
  ...buildPageMetadata(page, site),
  // Home carries the full company name rather than the `%s — Sato` template.
  title: { absolute: page.metaTitle ?? site.name },
};

/**
 * Home, in the plain layout the client prefers, carrying the oil and gas
 * integration's content (16 November).
 *
 * The welcome sits beside the photograph, as before, now opening with the
 * full name over "Engineering, infrastructure and upstream energy" and the
 * two ways in: Infrastructure and Oil & Gas. Then the motto, the two halves
 * of the company side by side, the figures in two labelled groups (so the
 * consortium's numbers are never read as Sato's own), the featured use case,
 * and the closing call to action.
 *
 * The NewDesign branch builds the same content into a longer, animated page;
 * the client asked for this design's look with that branch's content
 * (review of 20 November).
 */
export default function HomePage() {
  // The two holdings. Each lists its services; Oil & Gas, which asks for its
  // sections in the menu, also lists its capability pillars beneath it.
  const pillars: Pillar[] = getServiceBands().map((band) => ({
    id: band.group,
    label: band.label,
    intro: band.intro,
    href: band.href?.startsWith("/services#")
      ? `/services/${band.services[0].slug}`
      : (bandHref(band) ?? "/services"),
    image: band.image,
    links: bandItems(band).map((service) => {
      const first = getServiceNav(service)[0];
      const groups =
        service.showSectionsInMenu && first
          ? (service.sections[first.id as "capabilities"]?.groups ?? [])
          : [];
      return {
        label: service.name,
        href: `/services/${service.slug}`,
        children: groups.map((group) => ({
          label: group.heading,
          href: `/services/${service.slug}#${first.id}-${group.id}`,
        })),
      };
    }),
  }));

  const oilGas = getService("oil-gas");
  const statGroups = [
    {
      id: "sato",
      label: labels.statSato ?? "",
      stats: [
        { id: "years", value: getYearsInOperation(), label: labels.statYears ?? "" },
        // The count of projects on file. Off while `statProjects` is empty:
        // the client has done far more than the site lists (21 November),
        // so the file's count understates the record.
        ...(labels.statProjects
          ? [{ id: "projects", value: getProjects().length, label: labels.statProjects }]
          : []),
      ],
    },
    ...(oilGas.partner?.figures.length
      ? [{ id: "consortium", label: labels.statConsortium ?? "", stats: oilGas.partner.figures }]
      : []),
  ];

  const projectsLabels = getPage("projects").labels ?? {};
  const featured = getUseCases("oil-gas")[0];

  return (
    <>
      {/*
        Copy beside the photograph, not over it, as before. The heading is
        the new one; the full name sits above it, as its first mention.
      */}
      <section aria-labelledby="welcome-heading" className="bg-concrete">
        <div className="lg:grid lg:min-h-[32rem] lg:grid-cols-2 lg:items-stretch">
          {heroImage ? (
            <div className="relative aspect-4/3 w-full bg-steel/10 sm:aspect-16/9 lg:order-last lg:aspect-auto lg:h-full">
              <Image
                src={heroImage.src}
                alt={heroImage.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
                className="object-cover"
                style={heroImage.focalPoint ? { objectPosition: heroImage.focalPoint } : undefined}
              />
            </div>
          ) : null}

          <Container className="py-12 md:py-16 lg:flex lg:max-w-none lg:flex-col lg:justify-center lg:py-20 lg:pr-16">
            <div className="lg:ml-auto lg:w-full lg:max-w-[38rem]">
              <p className="eyebrow text-brand-ink">
                <RichText text={site.name} />
              </p>
              <Heading level={1} text={page.title} id="welcome-heading" className="mt-3" />

              {hero.subhead ? (
                <p className="mt-5 max-w-(--container-measure) text-lg text-steel-ink wdth-body text-pretty">
                  <RichText text={hero.subhead} />
                </p>
              ) : null}

              {welcome.body.map((paragraph, index) => (
                <p
                  key={index}
                  className="mt-5 max-w-(--container-measure) text-base text-asphalt wdth-body text-pretty"
                >
                  <RichText text={paragraph} />
                </p>
              ))}

              {hero.ctas?.length ? (
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {hero.ctas.map((link, position) => (
                    <Button
                      key={link.href}
                      label={link.label}
                      href={link.href}
                      variant={position === 0 ? "primary" : "secondary"}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </Container>
        </div>
      </section>

      {/* The motto, given the room it needs to be a motto. */}
      <Section tone="asphalt" labelledBy="motto-heading">
        <Container>
          <h2 id="motto-heading" className="sr-only">
            <RichText text={motto.heading ?? ""} />
          </h2>
          <p className="max-w-[20ch] text-display wdth-display text-balance text-concrete">
            <RichText text={motto.body[0]} />
          </p>
        </Container>
      </Section>

      {/* The two holdings, side by side and at the same weight. */}
      <Section tone="concrete" labelledBy="what-we-do-heading">
        <Container>
          <Heading level={2} text={whatWeDo.heading ?? ""} id="what-we-do-heading" />
          {whatWeDo.intro ? (
            <p className="mt-4 max-w-(--container-measure) text-lg text-steel-ink wdth-body text-pretty">
              <RichText text={whatWeDo.intro} />
            </p>
          ) : null}
          <HomePillars pillars={pillars} className="mt-10" />
        </Container>
      </Section>

      <Section tone="white" labelledBy="facts-heading">
        <Container>
          <Heading level={2} text={facts.heading} id="facts-heading" />
          <StatStrip groups={statGroups} className="mt-10" />
        </Container>
      </Section>

      {featured ? (
        <Section tone="concrete" labelledBy="featured-heading">
          <Container>
            <h2 id="featured-heading" className="eyebrow text-steel-ink">
              <RichText text={labels.featuredLabel ?? ""} />
            </h2>
            <UseCaseCard
              href={`/projects/oil-gas/${featured.slug}`}
              eyebrow={projectsLabels.useCase ?? ""}
              title={featured.title}
              clientDisplay={featured.clientDisplay}
              results={getFeaturedResults(featured)}
              linkLabel={projectsLabels.useCaseLink ?? ""}
              className="mt-4"
            />
          </Container>
        </Section>
      ) : null}

      {site.homeShowMissionVision ? (
        <Section tone="concrete" as="div">
          <Container>
            <StatementPair
              statements={[
                { id: mission.id, label: mission.heading ?? "", body: mission.body },
                { id: vision.id, label: vision.heading ?? "", body: vision.body },
              ]}
            />
          </Container>
        </Section>
      ) : null}

      <CtaBand heading={cta.heading} body={cta.body} ctas={cta.ctas} headingId="home-cta" />
    </>
  );
}
