import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { Heading } from "@/components/Heading";
import { PersonInitials } from "@/components/PersonInitials";
import { RegistrationsBlock } from "@/components/RegistrationsBlock";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";

import { getPage, getSection, getSite, getTeam } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import type { ProseSection } from "@/lib/content-types";

const page = getPage("hse");
const site = getSite();

export const metadata: Metadata = buildPageMetadata(page, site);

/** The policy sections, in content order, after the intro. */
const POLICY_IDS = [
  "policy-statement",
  "safety-management-system",
  "training",
  "protective-equipment",
  "incident-reporting",
  "quality-assurance",
];

export default function HsePage() {
  const intro = getSection(page, "intro", "prose");
  const lead = getSection(page, "hse-lead", "collection");
  const certifications = getSection(page, "certifications", "list");
  const cta = getSection(page, "cta", "cta");

  const policies: ProseSection[] = POLICY_IDS.map((id) => getSection(page, id, "prose"));

  const team = getTeam();
  const leadMembers = (lead.slugs ?? [])
    .map((slug) => team.find((member) => member.slug === slug))
    .filter((member): member is NonNullable<typeof member> => !!member);

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

      <Section tone="white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              {policies.map((policy) => (
                <section key={policy.id} className="mt-12 first:mt-0">
                  <Heading level={2} text={policy.heading ?? ""} size="h3" />
                  {policy.body.map((paragraph, index) => (
                    <p key={index} className="mt-4 text-base wdth-body">
                      <RichText text={paragraph} />
                    </p>
                  ))}
                </section>
              ))}
            </div>

            <div className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9">
              {leadMembers.length ? (
                <div className="border border-rule bg-concrete p-6">
                  <h2 className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body">
                    <RichText text={lead.heading ?? ""} />
                  </h2>

                  {leadMembers.map((member) => (
                    <div key={member.slug} className="mt-4 flex items-start gap-4">
                      {member.photo ? null : (
                        <PersonInitials name={member.name} size="sm" />
                      )}
                      <div className="min-w-0">
                        <p className="text-base font-bold wdth-heading">
                          <Link
                            href={`/leadership#${member.slug}`}
                            className="text-green-ink underline underline-offset-[0.2em] decoration-1 hover:text-laterite"
                          >
                            <RichText text={member.name} />
                          </Link>
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-laterite wdth-body">
                          <RichText text={member.title} />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Withheld in production while the only entry is a placeholder. */}
              <RegistrationsBlock
                heading={certifications.heading ?? ""}
                items={certifications.items}
                headingId="certifications"
              />
            </div>
          </div>
        </Container>
      </Section>

      <CtaBand heading={cta.heading} body={cta.body} ctas={cta.ctas} headingId="hse-cta" />
    </>
  );
}
