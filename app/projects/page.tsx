import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";

import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { DevelopImage } from "@/components/DevelopImage";
import { Eyebrow } from "@/components/Eyebrow";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { TextLink } from "@/components/TextLink";

import {
  getPage,
  getProjectBands,
  getProjectCount,
  getSection,
  getSite,
} from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import type { CollectionFacet } from "@/lib/content-types";
import { cn } from "@/lib/cn";

const page = getPage("projects");
const site = getSite();

const all = getSection(page, "all-projects", "collection");
const cta = getSection(page, "cta-default", "cta");
const labels = page.labels ?? {};

export const metadata: Metadata = buildPageMetadata(page, site);

/**
 * Projects: one door per service, grouped the way Services is grouped.
 *
 * The page used to be every project on one scroll behind a filter, then four
 * categories of our own devising. It is now the service list: the client's
 * instruction was that Projects mirror Services, so a reader who has found
 * the Electrical Engineering service knows without being told where its
 * projects are, and nobody has to learn a second taxonomy to navigate the
 * work.
 *
 * Only categories that hold something are here. Three of the eight are empty
 * today — Energy, Digital Twin and Research — and an empty tile leading to
 * an empty page is worse than no tile, so `getProjectBands()` drops them and
 * each returns the moment its first project lands.
 *
 * `getProjectCount` is what lets Oil & Gas sit here beside the others: its
 * rows live on the service rather than in projects.json, and the tile neither
 * knows nor cares.
 */
export default function ProjectsPage() {
  const bands = getProjectBands();

  /**
   * Bands as the page renders them.
   *
   * A band of several — Infrastructure — keeps its heading and its own grid.
   * A band of one *is* its single category, and its heading would be the same
   * words as the tile beneath it, so those bands are run together into one
   * grid with no heading. It is the same rule the services overview uses for
   * a category of one.
   */
  const rows = bands.reduce<Array<{ label?: string; categories: CollectionFacet[] }>>(
    (acc, band) => {
      const named =
        band.categories.length > 1 || band.label !== band.categories[0]?.label;

      if (named) {
        acc.push({ label: band.label, categories: band.categories });
        return acc;
      }

      const last = acc[acc.length - 1];
      if (last && !last.label) last.categories.push(...band.categories);
      else acc.push({ categories: [...band.categories] });
      return acc;
    },
    [],
  );

  // Tiles are numbered straight through the rows, so the first category of
  // the second row is 05, not 01 again.
  const numbers = new Map<string, number>();
  rows.flatMap((row) => row.categories).forEach((category, index) => {
    numbers.set(category.value, index + 1);
  });

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

          <div className="flex flex-col gap-16">
            {rows.map((row, index) => (
              <section
                key={row.label ?? `row-${index}`}
                aria-labelledby={row.label ? `row-${index}` : undefined}
              >
                {row.label ? (
                  <Reveal>
                    <Eyebrow
                      text={row.label}
                      tone="brand"
                      as="h3"
                      id={`row-${index}`}
                      className="mb-8 border-b border-asphalt pb-3"
                    />
                  </Reveal>
                ) : null}

                {/* The row takes as many columns as it has tiles, up to
                    four, so three categories fill the width instead of
                    leaving a quarter of it empty. A fifth wraps. */}
                <ul
                  className={cn(
                    "grid gap-x-6 gap-y-10",
                    row.categories.length > 1 && "sm:grid-cols-2",
                    row.categories.length === 3 && "lg:grid-cols-3",
                    row.categories.length >= 4 && "lg:grid-cols-4",
                  )}
                >
                  {row.categories.map((category, position) => {
                    return (
                      <Reveal key={category.value} as="li" index={position} className="flex">
                        <CategoryTile
                          category={category}
                          number={numbers.get(category.value) ?? position + 1}
                          // A row of one is set side-on across the full width
                          // rather than left as a quarter-width tile with three
                          // empty columns beside it. It is the same move the
                          // services overview makes for a category of one.
                          layout={row.categories.length === 1 ? "wide" : "stacked"}
                        />
                      </Reveal>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          {/* Clients is out of the main nav; this and the footer are how a
              reader who wants it still finds it. */}
          <p className="mt-12">
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

/**
 * One category: its photograph, its name, its line, and how much it holds.
 *
 * The photograph morphs into the header of the category's page when the
 * tile is opened — it is the same picture, and the reader should see that.
 */
function CategoryTile({
  category,
  number,
  layout = "stacked",
}: {
  category: CollectionFacet;
  number: number;
  layout?: "stacked" | "wide";
}) {
  const count = getProjectCount(category);
  const countLabel = (
    count === 1 ? labels.countOne ?? "" : labels.countMany ?? ""
  ).replace("{n}", String(count));
  const isWide = layout === "wide";

  return (
    <article
      className={cn(
        "group relative flex h-full w-full flex-col",
        isWide && "md:grid md:grid-cols-2 md:items-center md:gap-x-10",
      )}
    >
      {category.image ? (
        <ViewTransition name={`category-${category.slug}`}>
          <DevelopImage
            image={category.image}
            sizes={
              isWide
                ? "(min-width: 768px) 50vw, 100vw"
                : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            }
            zoom
            className={cn("w-full", isWide ? "aspect-16/9 md:aspect-3/2" : "aspect-4/3")}
          />
        </ViewTransition>
      ) : null}

      <div className={cn("flex flex-1 flex-col gap-3 pt-4", isWide && "md:pt-0")}>
        <div className="flex items-baseline justify-between gap-4">
          <span aria-hidden="true" className="eyebrow tabular text-steel-ink">
            {String(number).padStart(2, "0")}
          </span>
          <p className="eyebrow text-brand-ink tabular">
            <RichText text={countLabel} />
          </p>
        </div>

        <h4 className={cn("wdth-heading text-balance", isWide ? "text-h2" : "text-h3")}>
          <Link
            href={`/projects/${category.slug}`}
            className="text-asphalt no-underline after:absolute after:inset-0 after:content-['']"
          >
            <RichText text={category.label} />
          </Link>
        </h4>

        {category.intro ? (
          <p
            className={cn(
              "text-steel-ink wdth-body text-pretty",
              isWide ? "max-w-(--container-measure) text-base" : "text-sm",
            )}
          >
            <RichText text={category.intro} />
          </p>
        ) : null}
      </div>
    </article>
  );
}
