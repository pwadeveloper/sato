import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { PageHeader } from "@/components/PageHeader";
import { PersonCard } from "@/components/PersonCard";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";

import { getPage, getSection, getSite, getTeam } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("leadership");
const site = getSite();

/** The only profile allowed to name countries. See the note below. */
const FOUNDER_SLUG = "wale-osamiluyi";

export const metadata: Metadata = buildPageMetadata(page, site);

/**
 * Leadership.
 *
 * `getTeam()` only returns published members, so anyone whose status Sato has
 * not confirmed cannot reach this page, the sitemap or the structured data
 * even if they remain in team.json.
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
      <PageHeader
        title={page.title}
        image={page.images?.header}
        headingId="leadership-heading"
      />

      <Section tone="concrete">
        <Container>
          {/* One column on the measure. These are long prose profiles, not
              roster tiles, so they stack rather than sitting in a grid. */}
          <ul className="flex flex-col gap-12">
            {leadership.map((member) => (
              <li key={member.slug} className="max-w-(--container-measure)">
                <PersonCard
                  member={member}
                  headingLevel={2}
                  qualificationsLabel={labels.qualifications ?? ""}
                  membershipsLabel={labels.memberships ?? ""}
                  // The one exemption from the no-country rule, and the only
                  // place it is granted: the founder's own bio, by his own
                  // instruction. Scoped to him by slug so a later profile on
                  // this page cannot inherit it. See CLAUDE.md.
                  allowCountry={member.slug === FOUNDER_SLUG}
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
