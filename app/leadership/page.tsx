import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { PersonCard } from "@/components/PersonCard";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { TeamList } from "@/components/TeamList";

import { getPage, getSection, getSite, getTeam } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("leadership");
const site = getSite();

export const metadata: Metadata = buildPageMetadata(page, site);

export default function LeadershipPage() {
  const team = getTeam();
  const labels = page.labels ?? {};

  const intro = getSection(page, "intro", "prose");
  const leadershipSection = getSection(page, "leadership", "collection");
  const widerSection = getSection(page, "wider-team", "collection");

  const leaders = team.filter((member) => member.isLeadership);
  const wider = team.filter((member) => !member.isLeadership);

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

      <Section tone="white" labelledBy="leadership">
        <Container>
          <Heading
            level={2}
            text={leadershipSection.heading ?? ""}
            id="leadership"
          />

          <ul className="mt-10 grid gap-12 lg:grid-cols-3 lg:gap-10">
            {leaders.map((member) => (
              <li key={member.slug} id={member.slug} className="contents">
                <div className="scroll-mt-32">
                  <PersonCard
                    member={member}
                    qualificationsLabel={labels.qualifications ?? ""}
                    membershipsLabel={labels.memberships ?? ""}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="concrete" labelledBy="wider-team">
        <Container>
          <Heading level={2} text={widerSection.heading ?? ""} id="wider-team" />

          {widerSection.intro ? (
            <p className="mt-3 max-w-(--container-measure) text-base text-steel-ink wdth-body">
              <RichText text={widerSection.intro} />
            </p>
          ) : null}

          <TeamList members={wider} className="mt-8" />

          {widerSection.note ? (
            <p className="mt-6 max-w-(--container-measure) text-sm text-steel-ink wdth-body">
              <RichText text={widerSection.note} />
            </p>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
