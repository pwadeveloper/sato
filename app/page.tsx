import type { Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { StatementPair } from "@/components/StatementPair";
import { getPage, getSection, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("home");
const site = getSite();

const welcome = getSection(page, "welcome", "prose");
const motto = getSection(page, "motto", "prose");
// Held in the content whether or not it is shown — see `homeShowMissionVision`.
const mission = getSection(page, "mission", "prose");
const vision = getSection(page, "vision", "prose");

const heroImage = page.images?.hero;

export const metadata: Metadata = {
  ...buildPageMetadata(page, site),
  // Home carries the full company name rather than the `%s — Sato` template.
  title: { absolute: page.metaTitle ?? site.name },
};

/**
 * Home: a welcome and a motto. Nothing else.
 *
 * It used to run six sections deep — what we do, a company data plate, a
 * client strip, selected projects, a closing call to action. The client's
 * verdict was that it read as academic, and that the old site's plainness
 * was closer to what he wanted. So the page introduces the company and gets
 * out of the way; everything it used to summarise has a page of its own, and
 * the nav is how a visitor reaches it.
 *
 * The vision went the same way, and for a different reason: it was here
 * without the mission, and the client wants the two read together. They are
 * both on About. Setting `homeShowMissionVision` brings them back here as a
 * pair — never one alone.
 *
 * The components those sections used are still in `/components` and still
 * work. They are unused on purpose — the client said he wants to build on
 * this later, and deleting them would make that a rewrite instead of an
 * import.
 */
export default function HomePage() {
  return (
    <>
      {/*
        Copy beside the photograph, not over it. Two full paragraphs set in
        white over a picture is exactly the kind of thing that reads well in a
        mockup and badly on a phone in daylight, and this way the photograph
        is shown rather than dimmed to make room for text.
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
              />
            </div>
          ) : null}

          <Container className="py-12 md:py-16 lg:flex lg:max-w-none lg:flex-col lg:justify-center lg:py-20 lg:pr-16">
            <div className="lg:ml-auto lg:w-full lg:max-w-[38rem]">
              <Heading level={1} text={page.title} id="welcome-heading" />

              {welcome.body.map((paragraph, index) => (
                <p
                  key={index}
                  className="mt-6 max-w-(--container-measure) text-base text-asphalt wdth-body text-pretty"
                >
                  <RichText text={paragraph} />
                </p>
              ))}
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
    </>
  );
}
