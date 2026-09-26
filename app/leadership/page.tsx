import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { PersonCard } from "@/components/PersonCard";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";

import { getPage, getSection, getSite, getTeam } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("leadership");
const site = getSite();

export const metadata: Metadata = buildPageMetadata(page, site);

/**
 * Leadership.
 *
 * One person. `getTeam()` only returns published members, so anyone whose
 * status Sato has not confirmed cannot reach this page, the sitemap or the
 * structured data even if they remain in team.json.
 *
 * The section below carries the weight the old roster used to: it explains
 * that a project is staffed to its scope rather than from a fixed payroll,
 * which is the honest description of how the firm works.
 */
export default function LeadershipPage() {
  getSection(page, "leadership", "collection");
  const howWeBuild = getSection(page, "how-we-build-teams", "prose");

  const labels = page.labels ?? {};
  const leadership = getTeam();

  return (
    <>
      <Section tone="concrete">
        <Container>
          <Heading level={1} text={page.title} />

          <ul className="mt-10 grid gap-6 md:mt-12 lg:grid-cols-2">
            {leadership.map((member) => (
              <li key={member.slug} className="flex">
                <PersonCard
                  member={member}
                  headingLevel={2}
                  qualificationsLabel={labels.qualifications ?? ""}
                  membershipsLabel={labels.memberships ?? ""}
                />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="white" labelledBy="how-we-build-teams">
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-4">
              <Heading
                level={2}
                text={howWeBuild.heading ?? ""}
                id="how-we-build-teams"
              />
            </div>
            <div className="mt-5 flex flex-col gap-5 lg:col-span-7 lg:col-start-6 lg:mt-0">
              {howWeBuild.body.map((paragraph, index) => (
                <p
                  key={index}
                  className="max-w-(--container-measure) text-base text-asphalt wdth-body text-pretty"
                >
                  <RichText text={paragraph} />
                </p>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
