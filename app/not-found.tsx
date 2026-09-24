import type { Metadata } from "next";
import { BackedByStrip } from "@/components/BackedByStrip";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { getPage, getSection, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("not-found");
const site = getSite();

const intro = getSection(page, "intro", "prose");
const destinations = getSection(page, "destinations", "linkCards");

export const metadata: Metadata = {
  ...buildPageMetadata(page, site),
  // A 404 must never be indexed, whatever it is linked from.
  robots: { index: false, follow: true },
};

/**
 * 404.
 *
 * The old WordPress site had roughly a hundred URLs and most are redirected in
 * `vercel.json`, so anyone landing here followed a link that predates even
 * that. The page says plainly what happened and offers the four destinations a
 * visitor from a letter is most likely after — it is not an apology or a joke.
 */
export default function NotFound() {
  return (
    <Section tone="concrete" labelledBy="not-found-heading">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-4">
            <p
              aria-hidden="true"
              className="text-2xs font-semibold uppercase tracking-[0.08em] text-laterite wdth-body"
            >
              <RichText text={page.labels?.code ?? ""} />
            </p>
            <Heading
              level={1}
              text={page.title}
              id="not-found-heading"
              className="mt-3"
            />
          </div>

          <div className="mt-6 flex flex-col gap-5 lg:col-span-7 lg:col-start-6 lg:mt-0">
            {intro.body.map((paragraph, index) => (
              <p
                key={index}
                className="max-w-(--container-measure) text-base text-asphalt wdth-body text-pretty"
              >
                <RichText text={paragraph} />
              </p>
            ))}
          </div>
        </div>

        <BackedByStrip
          heading={destinations.heading}
          intro={destinations.intro}
          items={destinations.items}
          headingId="not-found-destinations"
          className="mt-14 md:mt-20"
        />
      </Container>
    </Section>
  );
}
