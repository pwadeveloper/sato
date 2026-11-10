import type { CSSProperties } from "react";
import type { Metadata } from "next";

import { Button } from "@/components/Button";
import { ClientMarquee } from "@/components/ClientMarquee";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { DataPlate } from "@/components/DataPlate";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { IndexList, type IndexListItem } from "@/components/IndexList";
import { Reveal } from "@/components/Reveal";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { StatementPair } from "@/components/StatementPair";
import { TextLink } from "@/components/TextLink";
import { HeroPhoto } from "@/components/home/HeroPhoto";
import { ProjectDoors } from "@/components/home/ProjectDoors";
import { SurveyBand } from "@/components/home/SurveyBand";

import {
  getClients,
  getCompanyFacts,
  getPage,
  getProjectCategories,
  getProjectCount,
  getSection,
  getServiceBands,
  getSite,
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
const selectedWork = getSection(page, "selected-work", "collection");
const facts = getSection(page, "facts", "facts");
const clientsSection = getSection(page, "clients", "collection");
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
 * Home: the company, in the order a verifying reader wants it.
 *
 * The welcome and the motto are the client's own words and open and anchor
 * the page as before. What follows is everything the site already holds,
 * pulled onto one page rather than written again: the five areas of work
 * (from the services), the project categories with their photographs (from
 * Projects), the company's facts (from site.json) and the clients' names
 * (from Clients). Nothing here is a claim the rest of the site does not
 * make, and every line of it is edited where it lives.
 *
 * The vision is still only ever shown with the mission, as a pair below the
 * motto, under `homeShowMissionVision`.
 */
export default function HomePage() {
  const bands = getServiceBands();
  const index: IndexListItem[] = bands.map((band) => {
    const items = bandItems(band);
    const solo = items.length === 0 ? band.services[0] : undefined;
    return {
      id: band.group,
      label: band.label,
      href: bandHref(band) ?? "/services",
      intro: solo ? solo.summary : band.intro,
      image: band.image,
      links: items.map((service) => ({
        label: service.name,
        href: `/services/${service.slug}`,
      })),
    };
  });

  const doors = getProjectCategories().map((category) => ({
    category,
    count: getProjectCount(category),
  }));

  const clients = getClients().filter((client) => client.category !== "oil-gas-partner");

  const [primary, ...secondary] = hero.ctas ?? [];

  return (
    <>
      {/*
        The hero. Copy on the left, the photograph on the right, developing
        from the drawing as the page paints. Nothing is set over the picture.
      */}
      <section aria-labelledby="welcome-heading" className="relative overflow-hidden bg-concrete dot-grid">
        <Container className="pt-10 md:pt-14 lg:pt-16">
          <div className="lg:grid lg:min-h-[36rem] lg:grid-cols-12 lg:gap-x-12">
            <div className="flex flex-col justify-end lg:col-span-7 lg:pb-10">
              <div data-fade="" style={{ "--fade-delay": "0ms" } as CSSProperties}>
                <Eyebrow text={site.tagline} tone="brand" />
              </div>

              <Heading
                level={1}
                size="display"
                text={page.title}
                id="welcome-heading"
                split
                splitDelay={120}
                className="mt-5 max-w-[15ch]"
              />

              {welcome.body[0] ? (
                <p
                  data-fade=""
                  style={{ "--fade-delay": "520ms" } as CSSProperties}
                  className="mt-8 max-w-[52ch] text-lg text-asphalt wdth-body text-pretty"
                >
                  <RichText text={welcome.body[0]} />
                </p>
              ) : null}

              {primary ? (
                <div
                  data-fade=""
                  style={{ "--fade-delay": "640ms" } as CSSProperties}
                  className="mt-8 flex flex-wrap items-center gap-3"
                >
                  <Button label={primary.label} href={primary.href} />
                  {secondary.map((link) => (
                    <Button key={link.href} label={link.label} href={link.href} variant="secondary" />
                  ))}
                </div>
              ) : null}
            </div>

            {heroImage ? (
              <div className="mt-10 lg:col-span-5 lg:col-start-8 lg:mt-0">
                <HeroPhoto
                  image={heroImage}
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="aspect-4/3 w-full sm:aspect-3/2 lg:aspect-4/5"
                />
              </div>
            ) : null}
          </div>
        </Container>

        {/* The rest of the welcome, set on the measure beside the picture's column. */}
        <Container className="py-12 md:py-16 lg:grid lg:grid-cols-12 lg:gap-x-12">
          <Reveal className="lg:col-span-7 lg:col-start-1">
            {welcome.body.slice(1).map((paragraph, position) => (
              <p
                key={position}
                className="max-w-(--container-measure) text-lg text-asphalt wdth-body text-pretty"
              >
                <RichText text={paragraph} />
              </p>
            ))}
            {labels.aboutLink ? (
              <p className="mt-6">
                <TextLink label={labels.aboutLink} href="/about" />
              </p>
            ) : null}
          </Reveal>
        </Container>
      </section>

      {/*
        The motto, over the survey field. The band is asphalt with the grid
        before the field loads and the field itself after, so the words are
        legible from the first frame.
      */}
      <section
        aria-labelledby="motto-heading"
        className="relative isolate flex min-h-[60svh] flex-col justify-end overflow-hidden bg-asphalt text-concrete dot-grid-dark md:min-h-[72svh]"
      >
        <SurveyBand />
        {/* `pointer-events-none`: the copy sits over the field, and the
            field's probe must still feel the pointer under the words. */}
        <Container className="pointer-events-none relative z-10 pb-12 pt-24 md:pb-16">
          <Eyebrow
            text={motto.heading ?? ""}
            tone="darkBrand"
            as="h2"
            id="motto-heading"
          />
          <p className="mt-4 max-w-[16ch] text-display wdth-display text-balance text-concrete">
            <RichText text={motto.body[0]} />
          </p>
        </Container>
      </section>

      {/* What we do: the five areas, with the pictures following the pointer. */}
      <Section tone="concrete" labelledBy="what-we-do-heading">
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
            <Reveal className="lg:col-span-7">
              <Eyebrow text={labels.servicesOf ?? ""} index={1} />
              <Heading
                level={2}
                text={whatWeDo.heading ?? ""}
                id="what-we-do-heading"
                className="mt-4"
              />
              {whatWeDo.intro ? (
                <p className="mt-5 max-w-(--container-measure) text-lg text-steel-ink wdth-body text-pretty">
                  <RichText text={whatWeDo.intro} />
                </p>
              ) : null}
            </Reveal>
          </div>

          <IndexList items={index} label={labels.indexLabel ?? whatWeDo.heading ?? ""} className="mt-10 md:mt-14" />

          {whatWeDo.ctas?.length ? (
            <div className="mt-10 flex flex-wrap gap-3">
              {whatWeDo.ctas.map((link, position) => (
                <Button
                  key={link.href}
                  label={link.label}
                  href={link.href}
                  variant={position === 0 ? "secondary" : "secondary"}
                />
              ))}
            </div>
          ) : null}
        </Container>
      </Section>

      {/* Projects: one door per published category, each its own photograph. */}
      <Section tone="paper" labelledBy="selected-work-heading">
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
            <Reveal className="lg:col-span-7">
              <Eyebrow text={labels.projectsOf ?? ""} index={2} />
              <Heading
                level={2}
                text={selectedWork.heading ?? ""}
                id="selected-work-heading"
                className="mt-4"
              />
              {selectedWork.intro ? (
                <p className="mt-5 max-w-(--container-measure) text-lg text-steel-ink wdth-body text-pretty">
                  <RichText text={selectedWork.intro} />
                </p>
              ) : null}
            </Reveal>
          </div>

          <ProjectDoors
            doors={doors}
            countOne={labels.countOne ?? ""}
            countMany={labels.countMany ?? ""}
            label={labels.doorsLabel ?? selectedWork.heading ?? ""}
            className="mt-10 md:mt-14"
          />

          {selectedWork.ctas?.length ? (
            <div className="mt-12 flex flex-wrap gap-3">
              {selectedWork.ctas.map((link) => (
                <Button key={link.href} label={link.label} href={link.href} variant="secondary" />
              ))}
            </div>
          ) : null}
        </Container>
      </Section>

      {/* The company's facts, as a plate, and the clients' names. */}
      <Section tone="concrete" as="div">
        <Container>
          <Reveal>
            <Eyebrow text={facts.heading} index={3} />
          </Reveal>
          <DataPlate
            facts={getCompanyFacts()}
            heading={facts.heading}
            headingId="facts-heading"
            className="mt-6"
          />
        </Container>

        <Container className="mt-20 md:mt-28">
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
            <Reveal className="lg:col-span-7">
              <Eyebrow text={labels.clientsLabel ?? ""} index={4} />
              <Heading
                level={2}
                text={clientsSection.heading ?? ""}
                id="clients-heading"
                className="mt-4"
              />
              {clientsSection.intro ? (
                <p className="mt-5 max-w-(--container-measure) text-lg text-steel-ink wdth-body text-pretty">
                  <RichText text={clientsSection.intro} />
                </p>
              ) : null}
            </Reveal>
          </div>
        </Container>

        <ClientMarquee
          clients={clients}
          label={clientsSection.heading ?? ""}
          className="mt-10"
        />

        {clientsSection.ctas?.length ? (
          <Container className="mt-8">
            {clientsSection.ctas.map((link) => (
              <TextLink key={link.href} label={link.label} href={link.href} />
            ))}
          </Container>
        ) : null}
      </Section>

      {site.homeShowMissionVision ? (
        <Section tone="paper" as="div">
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
