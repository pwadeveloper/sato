import type { Metadata } from "next";

import { Button } from "@/components/Button";
import { ClientMarquee } from "@/components/ClientMarquee";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { StatStrip } from "@/components/StatStrip";
import { StatementPair } from "@/components/StatementPair";
import { TextLink } from "@/components/TextLink";
import { UseCaseCard } from "@/components/UseCaseCard";
import { HomeHero } from "@/components/home/HomeHero";
import { HomePillars, type Pillar } from "@/components/home/HomePillars";
import { ProjectsRail } from "@/components/home/ProjectsRail";
import { SurveyBand } from "@/components/home/SurveyBand";

import {
  getClients,
  getCompanyFacts,
  getFeaturedResults,
  getPage,
  getProjectCategories,
  getProjectCount,
  getProjects,
  getSection,
  getService,
  getServiceBands,
  getServiceNav,
  getSite,
  getUseCases,
  getYearsInOperation,
} from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { bandHref, bandItems } from "@/lib/service-band";

const page = getPage("home");
const site = getSite();
const labels = page.labels ?? {};

const hero = getSection(page, "hero", "hero");
const welcome = getSection(page, "welcome", "prose");
const motto = getSection(page, "motto", "prose");
const whatWeDo = getSection(page, "what-we-do", "collection");
const selectedWork = getSection(page, "selected-work", "collection");
const facts = getSection(page, "facts", "facts");
const clientsSection = getSection(page, "clients", "collection");
// Held in the content whether or not it is shown — see `homeShowMissionVision`.
const mission = getSection(page, "mission", "prose");
const vision = getSection(page, "vision", "prose");
const cta = getSection(page, "cta", "cta");

const heroImage = hero.image ?? page.images?.hero;

export const metadata: Metadata = {
  ...buildPageMetadata(page, site),
  title: { absolute: page.metaTitle ?? site.name },
};

/** A section's opening: label, heading, and a line beside it on a desktop. */
function SectionHead({
  label,
  index,
  heading,
  headingId,
  intro,
  action,
  tone = "light",
}: {
  label: string;
  index: number;
  heading: string;
  headingId: string;
  intro?: string;
  action?: { label: string; href: string };
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-12">
      <div className="lg:col-span-7">
        <div data-anim="fade">
          <Eyebrow text={label} index={index} tone={dark ? "dark" : "light"} />
        </div>
        <Heading level={2} text={heading} id={headingId} split className={dark ? "mt-6 text-concrete" : "mt-6"} />
      </div>
      {intro || action ? (
        <div data-anim="fade" data-delay={200} className="mt-8 lg:col-span-5 lg:mt-0 lg:pb-2">
          {intro ? (
            <p className={dark ? "max-w-[44ch] text-lg text-steel-light text-pretty" : "max-w-[44ch] text-lg text-steel-ink text-pretty"}>
              <RichText text={intro} />
            </p>
          ) : null}
          {action ? (
            <div className="mt-6">
              <Button label={action.label} href={action.href} variant={dark ? "inverse" : "secondary"} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Home: the company, in the order a verifying reader wants it.
 *
 * The welcome and the motto are the client's own words. Everything else is
 * the site's own material brought onto one page rather than written again —
 * the areas of work from the services, the project categories from Projects,
 * the figures from the content itself, the clients' names from Clients — so
 * there is no claim here the rest of the site does not make, and every line
 * is edited where it lives. The figures are counted, not typed: years from
 * the founding year, projects from projects.json, areas from services.json.
 *
 * The vision is only ever shown with the mission, under
 * `homeShowMissionVision`.
 */
export default function HomePage() {
  // The two halves of the company. Each lists its services; a service that
  // asks for its sections in the menu (Oil & Gas) also lists the subsections
  // of its first section here — its three capability pillars, each linked to
  // its own place on the service page.
  const pillars: Pillar[] = getServiceBands().map((band) => ({
    id: band.group,
    label: band.label,
    intro: band.intro,
    href: bandHref(band) ?? "/services",
    image: band.image,
    links: bandItems(band).map((service) => {
      const first = getServiceNav(service)[0];
      const groups = service.showSectionsInMenu && first
        ? service.sections[first.id as "capabilities"]?.groups ?? []
        : [];
      return {
        label: service.name,
        href: `/services/${service.slug}`,
        children: groups.map((group) => ({
          label: group.heading,
          href: `/services/${service.slug}#${first.id}-${group.id}`,
        })),
      };
    }),
  }));

  const rail = getProjectCategories().map((category) => ({ category, count: getProjectCount(category) }));
  const clients = getClients().filter((client) => client.category !== "oil-gas-partner");
  const consortiumClients = getClients().filter((client) => client.category === "oil-gas-partner");

  // Two labelled groups, so the consortium's figures can never be read as
  // Sato's own record, nor Sato's founding year as the start of the oil and
  // gas work.
  const oilGas = getService("oil-gas");
  const statGroups = [
    {
      id: "sato",
      label: labels.statSato ?? "",
      stats: [
        { id: "years", value: getYearsInOperation(), label: labels.statYears ?? "" },
        { id: "projects", value: getProjects().length, label: labels.statProjects ?? "" },
      ],
    },
    ...(oilGas.partner?.figures.length
      ? [{ id: "consortium", label: labels.statConsortium ?? "", stats: oilGas.partner.figures }]
      : []),
  ];

  const featured = getUseCases("oil-gas")[0];

  // The registered name is the plate's own heading line; the rest sit under the figures.
  const plate = getCompanyFacts().filter((fact) => fact.id !== "yearsInOperation");

  return (
    <>
      {heroImage ? (
        <HomeHero
          eyebrow={site.name}
          title={page.title}
          lead={hero.subhead}
          ctas={hero.ctas ?? []}
          image={heroImage}
          caption={heroImage.caption}
        />
      ) : null}

      <Section tone="paper" labelledBy="what-we-do-heading">
        <Container>
          <SectionHead
            label={labels.servicesOf ?? ""}
            index={1}
            heading={whatWeDo.heading ?? ""}
            headingId="what-we-do-heading"
            intro={whatWeDo.intro}
            action={whatWeDo.ctas?.[0]}
          />
          <HomePillars pillars={pillars} className="mt-14 md:mt-16" />
        </Container>
      </Section>

      {/* The welcome: the founding line, then the second paragraph read a
          word at a time. */}
      <Section tone="concrete" labelledBy="about-label">
        <Container className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-3">
            <div data-anim="fade" className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
              <Eyebrow text={labels.aboutLabel ?? ""} as="h2" id="about-label" />
            </div>
          </div>
          <div className="mt-8 lg:col-span-9 lg:mt-0">
            <p data-anim="fade" className="mb-8 max-w-[52ch] text-lg text-steel-ink text-pretty">
              <RichText text={welcome.body[0]} />
            </p>
            {welcome.body.slice(1).map((paragraph, position) => (
              <p
                key={position}
                data-anim="scrub-words"
                className="font-display text-[clamp(1.875rem,1.2rem+2.4vw,3.5rem)] leading-[1.08] tracking-[-0.015em] text-asphalt"
              >
                <RichText text={paragraph} />
              </p>
            ))}
            {labels.aboutLink ? (
              <div data-anim="fade" className="mt-12">
                <Button label={labels.aboutLink} href="/about" variant="secondary" />
              </div>
            ) : null}
          </div>
        </Container>
      </Section>

      <section aria-labelledby="selected-work-heading" className="section-y bg-concrete">
        <Container>
          <SectionHead
            label={labels.projectsOf ?? ""}
            index={2}
            heading={selectedWork.heading ?? ""}
            headingId="selected-work-heading"
            intro={selectedWork.intro}
            action={selectedWork.ctas?.[0]}
          />
        </Container>
        <ProjectsRail
          items={rail}
          countOne={labels.countOne ?? ""}
          countMany={labels.countMany ?? ""}
          label={labels.doorsLabel ?? ""}
          allLabel={labels.allProjectsCard ?? ""}
          allHref="/projects"
          className="mt-14 md:mt-20"
        />
      </section>

      {/* The figures, over the survey field. */}
      <section
        aria-labelledby="facts-heading"
        className="relative isolate overflow-hidden bg-asphalt text-concrete"
      >
        <SurveyBand />
        <Container className="pointer-events-none relative z-10 section-y">
          <div data-anim="fade">
            <Eyebrow text={facts.heading} index={3} tone="dark" as="h2" id="facts-heading" />
          </div>

          <StatStrip groups={statGroups} tone="dark" className="mt-12 md:mt-16" />

          <dl data-anim="stagger" className="mt-14 grid gap-x-10 gap-y-8 border-t border-rule-dark pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {plate.map((fact) => (
              <div key={fact.id}>
                <dt className="eyebrow text-steel-light">
                  <RichText text={fact.label} />
                </dt>
                <dd className="mt-3 text-base text-concrete text-pretty">
                  <RichText text={fact.value} />
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {featured ? (
        <Section tone="paper" labelledBy="featured-heading">
          <Container>
            <Eyebrow text={labels.featuredLabel ?? ""} as="h2" id="featured-heading" />
            <UseCaseCard
              href={`/projects/oil-gas/${featured.slug}`}
              eyebrow={getPage("projects").labels?.useCase ?? ""}
              title={featured.title}
              clientDisplay={featured.clientDisplay}
              results={getFeaturedResults(featured)}
              linkLabel={getPage("projects").labels?.useCaseLink ?? ""}
              className="mt-6"
            />
          </Container>
        </Section>
      ) : null}

      <Section tone="concrete" labelledBy="clients-heading" className="overflow-hidden">
        <Container>
          <SectionHead
            label={labels.clientsLabel ?? ""}
            index={4}
            heading={clientsSection.heading ?? ""}
            headingId="clients-heading"
            intro={clientsSection.intro}
          />
        </Container>
        {/* Two rows, each labelled with whose clients they are. */}
        <div className="mt-14 flex flex-col gap-10 md:mt-20">
          <div>
            <Container>
              <p className="eyebrow text-xs! text-steel-ink">
                <RichText text={labels.clientsSato ?? ""} />
              </p>
            </Container>
            <ClientMarquee clients={clients} label={labels.clientsSato ?? ""} className="mt-3" />
          </div>
          {consortiumClients.length ? (
            <div>
              <Container>
                <p className="eyebrow text-xs! text-steel-ink">
                  <RichText text={labels.clientsConsortium ?? ""} />
                </p>
              </Container>
              <ClientMarquee clients={consortiumClients} label={labels.clientsConsortium ?? ""} reverse className="mt-3" />
            </div>
          ) : null}
        </div>
        {clientsSection.ctas?.length ? (
          <Container className="mt-12">
            {clientsSection.ctas.map((link) => (
              <TextLink key={link.href} label={link.label} href={link.href} />
            ))}
          </Container>
        ) : null}
      </Section>

      {site.homeShowMissionVision ? (
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
      ) : null}

      {/* The close: the question, the two ways on, and the motto across the page. */}
      <section aria-labelledby="home-cta" className="overflow-hidden bg-asphalt pt-[clamp(5rem,3rem+8vw,10rem)] text-concrete">
        <Container className="flex flex-col items-center text-center">
          <Heading level={2} text={cta.heading ?? ""} id="home-cta" split className="max-w-[22ch] text-concrete" />
          {cta.body ? (
            <p data-anim="fade" data-delay={200} className="mt-6 max-w-[50ch] text-lg text-steel-light text-pretty">
              <RichText text={cta.body} />
            </p>
          ) : null}
          <div data-anim="fade" data-delay={320} className="mt-10 flex flex-col gap-3 sm:flex-row">
            {cta.ctas.map((link, position) => (
              <Button key={link.href} label={link.label} href={link.href} variant={position === 0 ? "light" : "inverse"} />
            ))}
          </div>
        </Container>

        <div className="mt-[clamp(5rem,3rem+8vw,10rem)] border-t border-rule-dark px-(--gutter) pt-10">
          <h2 className="sr-only">
            <RichText text={motto.heading ?? ""} />
          </h2>
          <p
            data-anim="lines"
            className="font-display text-[clamp(3.5rem,13.5vw,16rem)] leading-[0.86] tracking-[-0.035em] text-concrete"
          >
            <RichText text={motto.body[0]} />
          </p>
        </div>
      </section>
    </>
  );
}
