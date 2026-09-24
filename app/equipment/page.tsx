import type { Metadata } from "next";

import { BackedByStrip } from "@/components/BackedByStrip";
import { Container } from "@/components/Container";
import { EquipmentSchedule } from "@/components/EquipmentSchedule";
import { Heading } from "@/components/Heading";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";

import { getEquipment, getPage, getSection, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("equipment");
const site = getSite();

export const metadata: Metadata = buildPageMetadata(page, site);

export default function EquipmentPage() {
  const equipment = getEquipment();
  const labels = page.labels ?? {};

  const intro = getSection(page, "intro", "prose");
  const fleet = getSection(page, "fleet", "collection");
  const putToWork = getSection(page, "put-to-work", "linkCards");

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

      <Section tone="white" className="pt-0! md:pt-0!">
        <Container>
          <EquipmentSchedule
            items={equipment}
            groups={fleet.facets ?? []}
            quantityLabel={labels.quantity ?? ""}
            locationLabel={labels.location ?? ""}
            className="border-t border-asphalt pt-12"
          />

          {fleet.note ? (
            <p className="mt-12 max-w-(--container-measure) text-sm text-steel-ink wdth-body">
              <RichText text={fleet.note} />
            </p>
          ) : null}
        </Container>
      </Section>

      <Section tone="concrete" labelledBy="put-to-work">
        <Container>
          <BackedByStrip
            heading={putToWork.heading}
            intro={putToWork.intro}
            items={putToWork.items}
            headingId="put-to-work"
          />
        </Container>
      </Section>
    </>
  );
}
