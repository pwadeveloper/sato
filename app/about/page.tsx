import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { StatementPair } from "@/components/StatementPair";
import { getPage, getSection, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("about");
const site = getSite();

const intro = getSection(page, "intro", "prose");
const motto = getSection(page, "motto", "prose");
const mission = getSection(page, "mission", "prose");
const vision = getSection(page, "vision", "prose");

/** The photograph beside the story. Hidden, not placeheld, when absent. */
const aside = page.images?.aside;

export const metadata: Metadata = buildPageMetadata(page, site);

/**
 * About: the company's own four paragraphs, its motto, its mission, its
 * vision.
 *
 * The page previously carried "How we work", "Where we're going", a
 * six-item recognition list and a call to action, laid out on a
 * label-left / prose-right grid. The client asked for something basic, like
 * the old site, and supplied replacement copy that says in four paragraphs
 * what those sections said in twelve. What he cut is cut, not relocated.
 *
 * From `lg` the story runs beside a photograph of delivered work rather than
 * under one: seven columns of prose, five of picture, top-aligned with the
 * first paragraph. The picture is `sticky`, so the right-hand side still has
 * something in it by the fourth paragraph instead of trailing off into
 * whitespace. Below `lg` it sits above the text at a moderate height — the
 * page opens with its header photograph and does not need a second hero.
 */
export default function AboutPage() {
  return (
    <>
      <PageHeader
        title={page.title}
        image={page.images?.header}
        headingId="about-heading"
      />

      <Section tone="concrete">
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
            {aside ? (
              /* First in the source so it is above the text on a phone;
                 placed into row 1 of the grid, so on desktop it is beside it
                 regardless of source order. `self-start` is what lets it
                 stick — a stretched grid item is already as tall as the row
                 and has nowhere to travel. */
              <div className="relative aspect-3/2 w-full bg-steel/10 sm:aspect-16/9 lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:aspect-3/4 lg:self-start">
                <Image
                  src={aside.src}
                  alt={aside.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="mt-8 flex max-w-(--container-measure) flex-col gap-6 lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:mt-0">
              {intro.body.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-lg text-asphalt wdth-body text-pretty"
                >
                  <RichText text={paragraph} />
                </p>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="asphalt" labelledBy="motto-heading" className="py-12! md:py-16!">
        <Container>
          <h2 id="motto-heading" className="sr-only">
            <RichText text={motto.heading ?? ""} />
          </h2>
          <p className="max-w-[20ch] text-h1 wdth-display text-balance text-concrete">
            <RichText text={motto.body[0]} />
          </p>
        </Container>
      </Section>

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
    </>
  );
}
