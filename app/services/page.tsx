import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/Container";
import { DevelopImage } from "@/components/DevelopImage";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";

import {
  getPage,
  getSection,
  getServiceBands,
  getServiceNav,
  getSite,
} from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { bandHref, bandItems } from "@/lib/service-band";
import { cn } from "@/lib/cn";

const page = getPage("services");
const site = getSite();

const intro = getSection(page, "intro", "prose");
const whySato = getSection(page, "why-sato", "list");

export const metadata: Metadata = buildPageMetadata(page, site);

/**
 * The services overview: five categories, each with its photograph.
 *
 * Every heading is a live link to the service it names — the client asked
 * for that specifically, having clicked one on the old build and had nothing
 * happen. Beneath it sit the category's own destinations: Infrastructure's
 * four disciplines, and Oil & Gas's four page sections, both set as one
 * separated line rather than a stack of cards, so the page reads as five
 * things rather than eleven.
 *
 * The rows alternate sides on desktop, each indexed in the mono, and the
 * photograph develops as its row scrolls in. It is the only ornament on the
 * page, and it exists so five near-identical rows do not read as a table.
 */
export default function ServicesPage() {
  const bands = getServiceBands();

  return (
    <>
      <PageHeader
        title={page.title}
        intro={intro.body}
        image={page.images?.header}
      />

      <Section tone="concrete" as="div">
        <Container>
          <ol className="flex flex-col gap-16 md:gap-24">
            {bands.map((band, index) => {
              const href = bandHref(band);
              const items = bandItems(band);
              const solo = items.length === 0 ? band.services[0] : undefined;
              // A category of one shows its service's summary; a category of
              // several shows its own intro, because no one summary covers
              // four disciplines.
              const lead = solo ? solo.summary : band.intro;

              /**
               * Where the row goes on: sub-services, or page sections.
               *
               * Page sections only where the service asks for them — every
               * service page has the same three now, and repeating them under
               * all five categories would be the same words five times. A
               * section that lives on another page is left out even then:
               * Oil & Gas "Projects" is `/projects/oil-gas`, which Projects
               * already lists under its own nav item.
               */
              const links = items.length
                ? items.map((service) => ({
                    key: service.slug,
                    label: service.name,
                    href: `/services/${service.slug}`,
                  }))
                : (solo?.showSectionsInMenu ? getServiceNav(solo) : [])
                    .filter((section) => !section.href)
                    .map((section) => ({
                      key: section.id,
                      label: section.label,
                      href: `/services/${solo?.slug}#${section.id}`,
                    }));

              const flip = index % 2 === 1;

              return (
                <Reveal
                  key={band.group}
                  as="li"
                  className="group lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-12"
                >
                  {band.image ? (
                    <div className={cn("lg:col-span-5", flip ? "lg:col-start-8" : "lg:col-start-1")}>
                      <Link href={href ?? "#"} tabIndex={-1} aria-hidden="true" className="block">
                        <DevelopImage
                          image={band.image}
                          sizes="(min-width: 1024px) 40vw, 100vw"
                          zoom
                          className="aspect-16/9 w-full lg:aspect-4/3"
                        />
                      </Link>
                    </div>
                  ) : null}

                  <div
                    className={cn(
                      "mt-6 lg:col-span-6 lg:mt-0",
                      flip ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-7",
                      !band.image && "lg:col-span-8 lg:col-start-1",
                    )}
                  >
                    <Eyebrow text={band.label} index={index + 1} className="sr-only" />
                    <p aria-hidden="true" className="eyebrow tabular text-steel-ink">
                      {String(index + 1).padStart(2, "0")}
                    </p>

                    <h2 className="mt-3 text-h2 wdth-heading text-balance">
                      {href ? (
                        <Link
                          href={href}
                          className="inline-flex items-baseline gap-4 text-asphalt no-underline transition-colors duration-150 hover:text-brand-ink"
                        >
                          <RichText text={band.label} />
                          <span
                            aria-hidden="true"
                            className="inline-block text-[0.55em] text-brand transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-1.5 motion-reduce:transition-none"
                          >
                            &rarr;
                          </span>
                        </Link>
                      ) : (
                        <RichText text={band.label} />
                      )}
                    </h2>

                    {lead ? (
                      <p className="mt-4 max-w-(--container-measure) text-base text-steel-ink wdth-body text-pretty">
                        <RichText text={lead} />
                      </p>
                    ) : null}

                    {links.length ? (
                      <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule pt-4">
                        {links.map((link) => (
                          <li key={link.key}>
                            <Link
                              href={link.href}
                              className="eyebrow link-draw text-brand-ink transition-colors duration-150 hover:text-brand-deep"
                            >
                              <RichText text={link.label} />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </Container>
      </Section>

      {/* Why Sato — nine short points, three across, indexed, not a column of bullets. */}
      <Section tone="paper" labelledBy="why-sato-heading">
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
            <Reveal className="lg:col-span-4">
              <Heading level={2} text={whySato.heading ?? ""} id="why-sato-heading" />
            </Reveal>

            {whySato.intro ? (
              <Reveal index={1} className="mt-5 lg:col-span-7 lg:col-start-6 lg:mt-0">
                <p className="max-w-(--container-measure) text-lg text-steel-ink wdth-body text-pretty">
                  <RichText text={whySato.intro} />
                </p>
              </Reveal>
            ) : null}
          </div>

          <ol className="mt-10 grid gap-x-10 border-t border-asphalt sm:grid-cols-2 lg:grid-cols-3">
            {whySato.items.map((item, index) => (
              <Reveal
                key={item}
                as="li"
                index={index}
                className="flex items-baseline gap-4 border-b border-rule py-4 text-base font-medium wdth-body"
              >
                <span aria-hidden="true" className="eyebrow tabular text-steel">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <RichText text={item} />
              </Reveal>
            ))}
          </ol>

          {whySato.note ? (
            <p className="mt-6 max-w-(--container-measure) text-xs text-steel-ink wdth-body">
              <RichText text={whySato.note} />
            </p>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
