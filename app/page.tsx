import type { Metadata } from "next";
import { ClientStrip } from "@/components/ClientStrip";
import { CompanyFactsPanel } from "@/components/CompanyFactsPanel";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { DivisionList } from "@/components/DivisionList";
import { Heading } from "@/components/Heading";
import { Hero } from "@/components/Hero";
import { ProjectCard } from "@/components/ProjectCard";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { TextLink } from "@/components/TextLink";
import {
  getCompanyFacts,
  getFeaturedClients,
  getFeaturedProjects,
  getPage,
  getSection,
  getServices,
  getSite,
} from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("home");
const site = getSite();

const hero = getSection(page, "hero", "hero");
const divisions = getSection(page, "divisions", "collection");
const facts = getSection(page, "company-at-a-glance", "facts");
const clients = getSection(page, "clients", "collection");
const selected = getSection(page, "selected-projects", "collection");
const closing = getSection(page, "closing", "cta");

const services = getServices();
const featuredClients = getFeaturedClients();
const featuredProjects = getFeaturedProjects();
const companyFacts = getCompanyFacts();

/** Sector value -> label, from the section's own facets. */
const sectorLabels = new Map(
  (selected.facets ?? []).map((facet) => [facet.value, facet.label]),
);

export const metadata: Metadata = {
  ...buildPageMetadata(page, site),
  // Home carries the full company name rather than the `%s — Sato` template.
  title: { absolute: page.metaTitle ?? site.name },
};

export default function HomePage() {
  const [lead, ...rest] = featuredProjects;

  return (
    <>
      <Hero
        headline={page.title}
        subhead={hero.subhead}
        ctas={hero.ctas}
        image={hero.image ?? site.heroImages[0]}
      />

      {/* 2. What we do */}
      <Section tone="concrete" labelledBy="divisions-heading">
        <Container>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            {divisions.heading ? (
              <Heading level={2} text={divisions.heading} id="divisions-heading" />
            ) : null}
            {divisions.ctas?.map((cta) => (
              <TextLink key={cta.href} label={cta.label} href={cta.href} />
            ))}
          </div>

          <DivisionList services={services} className="mt-10 md:mt-12" />
        </Container>
      </Section>

      {/* 3. Company at a glance — the page's signature element. */}
      <Section tone="concrete" as="div" className="pt-0">
        <Container>
          <CompanyFactsPanel
            heading={facts.heading}
            facts={companyFacts}
            headingId="company-at-a-glance"
          />
          {facts.note ? (
            <p className="mt-4 text-xs text-steel-ink wdth-body">
              <RichText text={facts.note} />
            </p>
          ) : null}
        </Container>
      </Section>

      {/* 4. Trusted by */}
      <Section tone="white" labelledBy="clients-heading">
        <Container>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            {clients.heading ? (
              <Heading level={2} text={clients.heading} id="clients-heading" />
            ) : null}
            {clients.ctas?.map((cta) => (
              <TextLink key={cta.href} label={cta.label} href={cta.href} />
            ))}
          </div>

          <ClientStrip clients={featuredClients} className="mt-10 md:mt-12" />
        </Container>
      </Section>

      {/* 5. Selected projects */}
      <Section tone="concrete" labelledBy="selected-projects-heading">
        <Container>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            {selected.heading ? (
              <Heading
                level={2}
                text={selected.heading}
                id="selected-projects-heading"
              />
            ) : null}
            {selected.ctas?.map((cta) => (
              <TextLink key={cta.href} label={cta.label} href={cta.href} />
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-6 md:mt-12">
            {lead ? (
              <ProjectCard
                project={lead}
                sectorLabel={sectorLabels.get(lead.sector) ?? lead.sector}
                layout="wide"
              />
            ) : null}

            {rest.length ? (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((project) => (
                  <li key={project.slug} className="flex">
                    <ProjectCard
                      project={project}
                      sectorLabel={sectorLabels.get(project.sector) ?? project.sector}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Container>
      </Section>

      {/* 6. Closing CTA */}
      <CtaBand
        heading={closing.heading}
        body={closing.body}
        ctas={closing.ctas}
        headingId="closing-heading"
      />
    </>
  );
}
