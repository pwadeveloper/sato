import Link from "next/link";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { ProjectCard } from "@/components/ProjectCard";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";

import {
  getPage,
  getProjectCategories,
  getProjectCategory,
  getProjectsInCategory,
  getSection,
  getSite,
} from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

/**
 * One project category.
 *
 * The three category routes are three files because a second dynamic segment
 * cannot sit beside `/projects/[slug]`. They hold nothing but the slug —
 * everything a category page is lives here, and every word of it comes out
 * of `pages/projects.json`, so adding a fourth category is a content edit
 * plus a four-line route file.
 */
export function buildCategoryMetadata(slug: string): Metadata {
  const page = getPage("projects");
  const category = getProjectCategory(slug);

  return buildPageMetadata(
    {
      ...page,
      slug: `projects/${slug}`,
      title: category.label,
      metaTitle: category.label,
      metaDescription: category.intro || page.metaDescription,
      ogImage: category.image ?? page.ogImage,
    },
    getSite(),
  );
}

export function ProjectCategoryPage({ slug }: { slug: string }) {
  const page = getPage("projects");
  const site = getSite();
  const cta = getSection(page, "cta-default", "cta");
  const labels = page.labels ?? {};

  const category = getProjectCategory(slug);
  const projects = getProjectsInCategory(category);
  const others = getProjectCategories().filter((entry) => entry.slug !== slug);

  return (
    <>
      <PageHeader
        title={category.label}
        intro={category.intro ? [category.intro] : []}
        image={category.image}
        headingId="category-heading"
        above={
          <Breadcrumbs
            trail={[{ label: page.title, href: "/projects" }]}
            current={category.label}
            label={labels.breadcrumb ?? page.title}
          />
        }
      />

      <Section tone="concrete">
        <Container>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <li key={project.slug} className="flex">
                <ProjectCard
                  project={project}
                  sectorLabel={category.label}
                  sectorShortLabel={category.shortLabel}
                  // Every card here is this category. Saying so eleven times
                  // is noise; the heading above already said it once.
                  showSector={false}
                  showDates={site.showProjectDates}
                />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {others.length ? (
        <Section tone="white" labelledBy="other-categories">
          <Container>
            <h2
              id="other-categories"
              className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body"
            >
              <RichText text={labels.otherCategories ?? ""} />
            </h2>

            <ul className="mt-4 grid gap-px border border-rule bg-rule md:grid-cols-2">
              {others.map((other) => (
                <li key={other.value}>
                  <Link
                    href={`/projects/${other.slug}`}
                    className="group flex h-full items-center justify-between gap-4 bg-white p-6 no-underline transition-colors duration-150 hover:bg-brand-tint"
                  >
                    <span className="text-xl font-bold wdth-heading text-balance text-asphalt">
                      <RichText text={other.label} />
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-steel transition-transform duration-150 group-hover:translate-x-1 group-hover:text-brand"
                    >
                      &rarr;
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <CtaBand
        heading={cta.heading}
        body={cta.body}
        ctas={cta.ctas}
        headingId={`cta-${slug}`}
      />
    </>
  );
}
