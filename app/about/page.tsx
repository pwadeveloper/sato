import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { DevelopImage } from "@/components/DevelopImage";
import { Eyebrow } from "@/components/Eyebrow";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { StatementPair } from "@/components/StatementPair";
import { getPage, getSection, getSite } from "@/lib/content";
import { cn } from "@/lib/cn";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("about");
const site = getSite();

const intro = getSection(page, "intro", "prose");
const motto = getSection(page, "motto", "prose");
const mission = getSection(page, "mission", "prose");
const vision = getSection(page, "vision", "prose");

/**
 * The pictures beside the story: a 2×2 grid of four photographs of water
 * work when `imageSets.aside` holds them, else the single `images.aside`.
 * Hidden, not placeheld, when both are absent.
 */
const asideSet = page.imageSets?.aside ?? [];
const aside = asideSet.length ? null : page.images?.aside;
const hasAside = Boolean(asideSet.length || aside);

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
 * From `lg` the story runs beside photographs of delivered water work rather
 * than under them: seven columns of prose, five of picture, top-aligned with
 * the first paragraph. The picture is `sticky`, so the right-hand side still
 * has something in it by the fourth paragraph instead of trailing off into
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
            {hasAside ? (
              /* First in the source so it is above the text on a phone;
                 placed into row 1 of the grid, so on desktop it is beside it
                 regardless of source order. `self-start` is what lets it
                 stick — a stretched grid item is already as tall as the row
                 and has nowhere to travel. */
              <div
                className={cn(
                  "relative w-full lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:self-start",
                  asideSet.length
                    ? /* Four separate images in a CSS grid, not one merged
                         file: each keeps its own alt text and its own srcset.
                         Square at `lg`, so every cell is square and a 4:3
                         photograph loses only its edges. */
                      "grid aspect-3/2 grid-cols-2 grid-rows-2 gap-2 sm:aspect-16/9 lg:aspect-square"
                    : "aspect-3/2 sm:aspect-16/9 lg:aspect-3/4",
                )}
              >
                {asideSet.length ? (
                  asideSet.map((image) => (
                    <DevelopImage
                      key={image.src}
                      image={image}
                      sizes="(min-width: 1024px) 20vw, 50vw"
                      className="h-full w-full"
                    />
                  ))
                ) : aside ? (
                  <DevelopImage
                    image={aside}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="h-full w-full"
                  />
                ) : null}
              </div>
            ) : null}

            <div className="mt-8 flex max-w-(--container-measure) flex-col gap-6 lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:mt-0">
              {intro.body.map((paragraph, index) => (
                <Reveal key={index} as="p" index={index} className="text-lg text-asphalt wdth-body text-pretty">
                  <RichText text={paragraph} />
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="asphalt" labelledBy="motto-heading" className="dot-grid-dark py-14! md:py-20!">
        <Container>
          <Eyebrow text={motto.heading ?? ""} tone="darkBrand" as="h2" id="motto-heading" />
          <p className="mt-4 max-w-[18ch] text-h1 wdth-display text-balance text-concrete">
            <RichText text={motto.body[0]} />
          </p>
        </Container>
      </Section>

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
    </>
  );
}
