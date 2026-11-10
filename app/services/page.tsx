import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { ServicesIndex, type ServicesIndexItem } from "@/components/ServicesIndex";
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
 * They are set as the index Home uses, the category's photograph following
 * the pointer, so the two pages read Sato's work the same way.
 */
export default function ServicesPage() {
  const bands = getServiceBands();

  const items: ServicesIndexItem[] = bands.map((band) => {
    const href = bandHref(band) ?? "/services";
    const children = bandItems(band);
    const solo = children.length === 0 ? band.services[0] : undefined;
    // A category of one shows its service's summary; a category of several
    // shows its own intro, because no one summary covers four disciplines.
    // Beneath it, the category's own destinations: Infrastructure's four
    // disciplines, or the sections of a page that asks to list them.
    const links = children.length
      ? children.map((service) => ({ label: service.name, href: `/services/${service.slug}` }))
      : (solo?.showSectionsInMenu ? getServiceNav(solo) : [])
          .filter((section) => !section.href)
          .map((section) => ({ label: section.label, href: `/services/${solo?.slug}#${section.id}` }));
    return {
      id: band.group,
      label: band.label,
      href,
      intro: solo ? solo.summary : band.intro,
      image: band.image,
      links,
    };
  });

  return (
    <>
      <PageHeader
        title={page.title}
        intro={intro.body}
        image={page.images?.header}
      />

      {/* The five categories, as the same index Home uses: one way of
          reading Sato's work, wherever it is listed. */}
      <Section tone="concrete" as="div">
        <Container>
          <ServicesIndex items={items} label={page.title} />
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
