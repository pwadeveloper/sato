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
 * Only categories that hold something are here. Four of the eight are empty
 * today — Mechanical, Energy, Digital Twin and Research — and an empty tile
 * leading to an empty page is worse than no tile, so `getProjectBands()`
 * drops them and each returns the moment its first project lands.
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

          <div className="flex flex-col gap-12">
            {rows.map((row, index) => (
              <section
                key={row.label ?? `row-${index}`}
                aria-labelledby={row.label ? `row-${index}` : undefined}
              >
                {row.label ? (
                  <h3
                    id={`row-${index}`}
                    className="mb-6 border-b border-asphalt pb-3 text-2xs font-semibold uppercase tracking-[0.08em] text-brand-deep wdth-body"
                  >
                    <RichText text={row.label} />
                  </h3>
                ) : null}

                {/* The row takes as many columns as it has tiles, up to
                    four, so three categories fill the width instead of
                    leaving a quarter of it empty. A fifth wraps. */}
                <ul
                  className={cn(
                    "grid gap-6",
                    row.categories.length > 1 && "sm:grid-cols-2",
                    row.categories.length === 3 && "lg:grid-cols-3",
                    row.categories.length >= 4 && "lg:grid-cols-4",
                  )}
                >
                  {row.categories.map((category) => (
                    <li key={category.value} className="flex">
                      <CategoryTile
                        category={category}
                        // A row of one is set side-on across the full width
                        // rather than left as a quarter-width tile with three
                        // empty columns beside it. It is the same move the
                        // services overview makes for a category of one.
                        layout={row.categories.length === 1 ? "wide" : "stacked"}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

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

/** One category: its photograph, its name, its line, and how much it holds. */
function CategoryTile({
  category,
  layout = "stacked",
}: {
  category: CollectionFacet;
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
        "group relative flex h-full w-full flex-col border border-rule bg-white transition-colors duration-150 hover:border-steel focus-within:border-steel",
        isWide && "md:grid md:grid-cols-2 md:items-stretch",
      )}
    >
      {category.image ? (
        <div
          className={cn(
            "relative w-full overflow-hidden bg-steel/10",
            isWide ? "aspect-16/9 md:aspect-auto md:h-full" : "aspect-4/3",
          )}
        >
          <Image
            src={category.image.src}
            alt={category.image.alt}
            fill
            sizes={
              isWide
                ? "(min-width: 768px) 50vw, 100vw"
                : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover"
          />
        </div>
      ) : null}

      <div
        className={cn(
          "flex flex-1 flex-col gap-3 p-6",
          isWide && "md:justify-center md:p-8",
        )}
      >
        <h4 className="text-h3 wdth-heading text-balance">
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
              isWide
                ? "max-w-(--container-measure) text-base"
                : "text-sm",
            )}
          >
            <RichText text={category.intro} />
          </p>
        ) : null}

        <p className="mt-auto pt-2 text-2xs font-semibold uppercase tracking-[0.08em] text-brand-ink tabular wdth-body">
          <RichText text={countLabel} />
        </p>
      </div>
    </article>
  );
}
