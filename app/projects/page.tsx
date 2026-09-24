import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { Heading } from "@/components/Heading";
import { ProjectFilter } from "@/components/ProjectFilter";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { getPage, getProjects, getSection, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("projects");
const site = getSite();

const all = getSection(page, "all-projects", "collection");
const cta = getSection(page, "cta-default", "cta");

const projects = getProjects();
const labels = page.labels ?? {};

/**
 * A sector tab appears only once a project uses that sector, so Energy shows
 * up on its own the moment the first energy project is added to the JSON — no
 * code change, and no empty tab in the meantime.
 */
const facets = (all.facets ?? []).filter((facet) =>
  projects.some((project) => project.sector === facet.value),
);

export const metadata: Metadata = buildPageMetadata(page, site);

export default function ProjectsPage() {
  return (
    <>
      <Section tone="concrete" labelledBy="projects-heading">
        <Container>
          <Heading level={1} text={page.title} id="projects-heading" />

          {all.intro ? (
            <p className="mt-5 max-w-(--container-measure) text-lg text-steel-ink wdth-body">
              <RichText text={all.intro} />
            </p>
          ) : null}

          <div className="mt-10 md:mt-12">
            <ProjectFilter
              projects={projects}
              facets={facets}
              labels={{
                filterLabel: labels.filterLabel ?? "",
                all: labels.allFilter ?? "",
                countOne: labels.countOne ?? "",
                countMany: labels.countMany ?? "",
              }}
            />
          </div>

          {all.note ? (
            <p className="mt-10 max-w-(--container-measure) text-xs text-steel-ink wdth-body">
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
