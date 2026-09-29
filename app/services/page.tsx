import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";

import { getPage, getSection, getServiceBands, getSite } from "@/lib/content";
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
 * The rows alternate sides on desktop. It is the only ornament on the page,
 * and it exists so five near-identical rows do not read as a table.
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
          <ul className="flex flex-col gap-14 md:gap-20">
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
               * A section that has moved off its page is left out — Oil & Gas
               * "Projects" is `/projects/oil-gas`, which Projects already
               * lists under its own nav item, and the client asked for it in
               * one place rather than two. Its `sectionNav` entry stays in the
               * content for the in-page sub-nav.
               */
              const links = items.length
                ? items.map((service) => ({
                    key: service.slug,
                    label: service.name,
                    href: `/services/${service.slug}`,
                  }))
                : (solo?.sectionNav ?? [])
                    .filter((section) => !section.href)
                    .map((section) => ({
                      key: section.id,
                      label: section.label,
                      href: `/services/${solo?.slug}#${section.id}`,
                    }));

              return (
                <li
                  key={band.group}
                  className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-12"
                >
                  {band.image ? (
                    <div
                      className={cn(
                        "relative aspect-16/9 w-full bg-steel/10 lg:col-span-5 lg:aspect-4/3",
                        index % 2 === 1 ? "lg:col-start-8" : "lg:col-start-1",
                      )}
                    >
                      <Image
                        src={band.image.src}
                        alt={band.image.alt}
                        fill
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <div
                    className={cn(
                      "mt-6 lg:col-span-6 lg:mt-0",
                      index % 2 === 1 ? "lg:col-start-1" : "lg:col-start-7",
                    )}
                  >
                    <h2 className="text-h2 wdth-heading text-balance">
                      {href ? (
                        <Link
                          href={href}
                          className="group text-asphalt no-underline transition-colors duration-150 hover:text-brand-ink"
                        >
                          <RichText text={band.label} />
                          <span
                            aria-hidden="true"
                            className="ml-3 inline-block text-[0.6em] text-steel transition-transform duration-150 group-hover:translate-x-1 group-hover:text-brand"
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
                      /* The separator trails its own item rather than
                         leading the next one. Four service names do not fit
                         on one line at any phone width, and a leading
                         separator leaves a pipe stranded at the start of
                         every wrapped line. */
                      <ul className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-rule pt-4">
                        {links.map((link, position) => (
                          <li key={link.key} className="flex items-center gap-x-2">
                            <Link
                              href={link.href}
                              className="text-sm font-semibold text-brand-ink underline underline-offset-[0.2em] decoration-1 decoration-brand-ink/40 wdth-body transition-colors duration-150 hover:text-brand-deep hover:decoration-brand-deep"
                            >
                              <RichText text={link.label} />
                            </Link>
                            {position < links.length - 1 ? (
                              <span aria-hidden="true" className="text-steel">
                                |
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* Why Sato — nine short points, three across, not a column of bullets. */}
      <Section tone="white" labelledBy="why-sato-heading">
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-4">
              <h2
                id="why-sato-heading"
                className="text-h2 wdth-heading text-balance"
              >
                <RichText text={whySato.heading ?? ""} />
              </h2>
            </div>

            {whySato.intro ? (
              <p className="mt-5 max-w-(--container-measure) text-lg text-steel-ink wdth-body text-pretty lg:col-span-7 lg:col-start-6 lg:mt-0">
                <RichText text={whySato.intro} />
              </p>
            ) : null}
          </div>

          <ul className="mt-10 grid gap-x-10 border-t border-asphalt sm:grid-cols-2 lg:grid-cols-3">
            {whySato.items.map((item) => (
              <li
                key={item}
                className="border-b border-rule py-4 text-base font-medium wdth-body"
              >
                <RichText text={item} />
              </li>
            ))}
          </ul>

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
