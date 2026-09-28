import type { Metadata } from "next";
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

export const metadata: Metadata = buildPageMetadata(page, site);

/**
 * About: the company's own four paragraphs, its motto, its mission, its
 * vision. One column, one photograph.
 *
 * The page previously carried "How we work", "Where we're going", a
 * six-item recognition list and a call to action, laid out on a
 * label-left / prose-right grid. The client asked for something basic, like
 * the old site, and supplied replacement copy that says in four paragraphs
 * what those sections said in twelve. What he cut is cut, not relocated.
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
          <div className="flex max-w-(--container-measure) flex-col gap-6">
            {intro.body.map((paragraph, index) => (
              <p
                key={index}
                className="text-lg text-asphalt wdth-body text-pretty"
              >
                <RichText text={paragraph} />
              </p>
            ))}
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
