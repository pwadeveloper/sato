import type { Metadata } from "next";

import { Button } from "@/components/Button";
import { ClientMarquee } from "@/components/ClientMarquee";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { ServicesIndex, type ServicesIndexItem } from "@/components/ServicesIndex";
import { StatementPair } from "@/components/StatementPair";
import { TextLink } from "@/components/TextLink";
import { HomeHero } from "@/components/home/HomeHero";
import { ProjectsRail } from "@/components/home/ProjectsRail";
import { SurveyBand } from "@/components/home/SurveyBand";

import {
  getClients,
  getCompanyFacts,
  getPage,
  getProjectCategories,
  getProjectCount,
  getProjects,
  getSection,
  getServiceBands,
  getServices,
  getSite,
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
  const index: ServicesIndexItem[] = getServiceBands().map((band) => {
    const items = bandItems(band);
    const solo = items.length === 0 ? band.services[0] : undefined;
    return {
      id: band.group,
      label: band.label,
      href: bandHref(band) ?? "/services",
      intro: solo ? solo.summary : band.intro,
      image: band.image,
      links: items.map((service) => ({ label: service.name, href: `/services/${service.slug}` })),
    };
  });

  const rail = getProjectCategories().map((category) => ({ category, count: getProjectCount(category) }));
  const clients = getClients().filter((client) => client.category !== "oil-gas-partner");
  const half = Math.ceil(clients.length / 2);

  const stats = [
    { id: "years", value: getYearsInOperation(), label: labels.statYears ?? "" },
    { id: "projects", value: getProjects().length, label: labels.statProjects ?? "" },
    { id: "services", value: getServices().length, label: labels.statServices ?? "" },
  ];
  // The registered name is the plate's own heading line; the rest sit under the figures.
  const plate = getCompanyFacts().filter((fact) => fact.id !== "yearsInOperation");

  return (
    <>
      {heroImage ? (
        <HomeHero
          eyebrow={site.tagline}
          title={page.title}
          titleMuted={labels.titleMuted}
          lead={welcome.body[0]}
          ctas={hero.ctas ?? []}
          image={heroImage}
          caption={heroImage.caption}
        />
      ) : null}

      {/* The second paragraph of the welcome, read a word at a time. */}
      <Section tone="concrete" labelledBy="about-label">
        <Container className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-3">
            <div data-anim="fade" className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
              <Eyebrow text={labels.aboutLabel ?? ""} as="h2" id="about-label" />
            </div>
          </div>
          <div className="mt-8 lg:col-span-9 lg:mt-0">
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
          <ServicesIndex items={index} label={labels.indexLabel ?? whatWeDo.heading ?? ""} className="mt-16 md:mt-20" />
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

          <ul className="mt-12 md:mt-16">
            {stats.map((stat) => (
              <li
                key={stat.id}
                data-anim="fade"
                className="border-t border-rule-dark py-5 font-display text-[clamp(2.75rem,1.4rem+5.2vw,7rem)] leading-[1] tracking-[-0.025em] md:py-7"
              >
                <span data-anim="count" data-value={stat.value} className="tabular text-concrete">
                  {stat.value}
                </span>{" "}
                <span className="text-steel-light">
                  <RichText text={stat.label} />
                </span>
              </li>
            ))}
          </ul>

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
        <div className="mt-14 flex flex-col gap-2 md:mt-20">
          <ClientMarquee clients={clients.slice(0, half)} label={clientsSection.heading ?? ""} />
          <ClientMarquee clients={clients.slice(half)} label={clientsSection.heading ?? ""} reverse />
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
