import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { Heading } from "@/components/Heading";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { StatementPair } from "@/components/StatementPair";
import { getPage, getSection, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("about");
const site = getSite();

const intro = getSection(page, "intro", "prose");
const newName = getSection(page, "new-name", "prose");
const howWeWork = getSection(page, "how-we-work", "prose");
const mission = getSection(page, "mission", "prose");
const vision = getSection(page, "vision", "prose");
const recognition = getSection(page, "recognition", "list");
const cta = getSection(page, "about-cta", "cta");

export const metadata: Metadata = buildPageMetadata(page, site);

/**
 * The page's spine: heading in a left column, prose in a right one.
 *
 * It is the same label-left / value-right structure as the data plate and the
 * divisions register, so About reads as part of the same system instead of a
 * column of text stranded against an empty right half.
 */
function ProseBlock({
  heading,
  headingId,
  headingLevel = 2,
  body,
  lead = false,
  children,
}: {
  heading?: string;
  headingId?: string;
  headingLevel?: 1 | 2;
  body: string[];
  lead?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
      {heading ? (
        <div className="lg:col-span-4">
          <Heading level={headingLevel} text={heading} id={headingId} />
        </div>
      ) : null}

      <div
        className={
          heading
            ? "mt-5 flex flex-col gap-5 lg:col-span-7 lg:col-start-6 lg:mt-0"
            : "flex flex-col gap-5 lg:col-span-7 lg:col-start-6"
        }
      >
        {body.map((paragraph, index) => (
          <p
            key={index}
            className={
              lead
                ? "max-w-(--container-measure) text-lg text-asphalt wdth-body text-pretty"
                : "max-w-(--container-measure) text-base text-asphalt wdth-body text-pretty"
            }
          >
            <RichText text={paragraph} />
          </p>
        ))}
        {children}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* 1. H1 and intro */}
      <Section tone="concrete" labelledBy="about-heading" className="border-b border-rule">
        <Container>
          <ProseBlock
            heading={page.title}
            headingId="about-heading"
            headingLevel={1}
            body={intro.body}
            lead
          />
        </Container>
      </Section>

      {/* 2. Our new name, and 3. How we work */}
      <Section tone="concrete">
        <Container>
          <div className="flex flex-col gap-14 md:gap-20">
            <ProseBlock
              heading={newName.heading}
              headingId="new-name-heading"
              body={newName.body}
            >
              {/* The former name, pulled out of the paragraph and stated on its
                  own — this is the line a visitor checks against their records. */}
              <p className="border-l-[3px] border-laterite py-1 pl-5 text-base font-medium text-asphalt wdth-body">
                <RichText text={site.formerNameLabel} />
              </p>
            </ProseBlock>

            <ProseBlock
              heading={howWeWork.heading}
              headingId="how-we-work-heading"
              body={howWeWork.body}
            />
          </div>
        </Container>
      </Section>

      {/* 4. Mission and vision — the page's full-width moment. */}
      <Section tone="concrete" as="div" className="pt-0">
        <Container>
          <StatementPair
            className="border-y border-rule"
            statements={[
              { id: mission.id, label: mission.heading ?? "", body: mission.body },
              { id: vision.id, label: vision.heading ?? "", body: vision.body },
            ]}
          />
        </Container>
      </Section>

      {/* 5. Recognition */}
      <Section tone="white" labelledBy="recognition-heading">
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-4">
              {recognition.heading ? (
                <Heading level={2} text={recognition.heading} id="recognition-heading" />
              ) : null}
              {recognition.intro ? (
                <p className="mt-4 text-base text-steel-ink wdth-body">
                  <RichText text={recognition.intro} />
                </p>
              ) : null}
            </div>

            <div className="mt-8 lg:col-span-7 lg:col-start-6 lg:mt-0">
              <ul className="border-y border-asphalt">
                {recognition.items.map((item, index) => (
                  <li
                    key={index}
                    className="border-b border-rule py-5 last:border-b-0"
                  >
                    <span className="block max-w-(--container-measure) text-base text-asphalt wdth-body">
                      <RichText text={item} />
                    </span>
                  </li>
                ))}
              </ul>

              {recognition.note ? (
                <p className="mt-4 text-xs text-steel-ink wdth-body">
                  <RichText text={recognition.note} />
                </p>
              ) : null}
            </div>
          </div>
        </Container>
      </Section>

      {/* 6. CTA to Leadership and Contact */}
      <CtaBand
        heading={cta.heading}
        body={cta.body}
        ctas={cta.ctas}
        headingId="about-cta-heading"
      />
    </>
  );
}
