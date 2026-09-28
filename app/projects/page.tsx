import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { TextLink } from "@/components/TextLink";

import {
  getPage,
  getProjectCategories,
  getProjectCount,
  getSection,
  getSite,
} from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("projects");
const site = getSite();

const all = getSection(page, "all-projects", "collection");
const cta = getSection(page, "cta-default", "cta");
const labels = page.labels ?? {};

export const metadata: Metadata = buildPageMetadata(page, site);

/**
 * Projects: four doors, no list.
 *
 * The page used to be every project on one scroll behind a filter. The
 * client's objection was that someone who came for water work had to scroll
 * past buildings and roads to reach it, and that whole categories were being
 * missed — which is what a filter does when nobody notices it is there.
 *
 * So the categories are the page. Each tile says what it holds and how much
 * of it, and the count comes from the content rather than a number anyone
 * has to remember to update. `getProjectCount` is what lets Oil & Gas sit
 * here beside the other three: its rows live on the service rather than in
 * projects.json, and the tile neither knows nor cares.
 */
export default function ProjectsPage() {
  const categories = getProjectCategories();

  return (
    <>
      <PageHeader
        title={page.title}
        intro={all.intro ? [all.intro] : []}
        image={page.images?.header}
        headingId="projects-heading"
      />

      <Section tone="concrete" labelledBy="project-categories">
        <Container>
          <h2 id="project-categories" className="sr-only">
            <RichText text={labels.categoriesLabel ?? page.title} />
          </h2>

          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const count = getProjectCount(category);
              const countLabel = (
                count === 1 ? labels.countOne ?? "" : labels.countMany ?? ""
              ).replace("{n}", String(count));

              return (
                <li key={category.value} className="flex">
                  <article className="group relative flex h-full w-full flex-col border border-rule bg-white transition-colors duration-150 hover:border-steel focus-within:border-steel">
                    {category.image ? (
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-steel/10">
                        <Image
                          src={category.image.src}
                          alt={category.image.alt}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    ) : null}

                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <h3 className="text-h3 wdth-heading text-balance">
                        <Link
                          href={`/projects/${category.slug}`}
                          className="text-asphalt no-underline after:absolute after:inset-0 after:content-['']"
                        >
                          <RichText text={category.label} />
                        </Link>
                      </h3>

                      {category.intro ? (
                        <p className="text-sm text-steel-ink wdth-body text-pretty">
                          <RichText text={category.intro} />
                        </p>
                      ) : null}

                      <p className="mt-auto pt-2 text-2xs font-semibold uppercase tracking-[0.08em] text-brand-ink tabular wdth-body">
                        <RichText text={countLabel} />
                      </p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          {/* Clients is out of the main nav; this and the footer are how a
              reader who wants it still finds it. */}
          <p className="mt-10">
            <TextLink label={labels.clientsLink ?? ""} href="/clients" />
          </p>

          {all.note ? (
            <p className="mt-6 max-w-(--container-measure) text-xs text-steel-ink wdth-body">
              <RichText text={all.note} />
            </p>
          ) : null}
        </Container>
      </Section>

      <CtaBand
        heading={cta.heading}
        body={cta.body}
        ctas={cta.ctas}
        headingId="projects-cta"
      />
    </>
  );
}
