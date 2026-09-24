import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { CapabilityList } from "@/components/CapabilityList";
import { ClientList } from "@/components/ClientList";
import { CompanyFactsPanel } from "@/components/CompanyFactsPanel";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { Heading } from "@/components/Heading";
import { PersonCard } from "@/components/PersonCard";
import { ProjectCard } from "@/components/ProjectCard";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { Tag } from "@/components/Tag";
import { TextLink } from "@/components/TextLink";

import {
  getClients,
  getCompanyFacts,
  getPage,
  getProjects,
  getService,
  getTeam,
} from "@/lib/content";
import type { CollectionSection } from "@/lib/content-types";

/**
 * Internal design reference. Not linked from nav (which comes from site.json)
 * and excluded from indexing.
 *
 * This is the one place in the codebase with inline strings: they are labels
 * for a developer-facing tool, not site copy, so they are deliberately outside
 * the /content model that CLAUDE.md rule 1 governs.
 */
export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const COLOURS = [
  { name: "green", hex: "#177B0B", note: "Brand. Button fill. White on it 5.4:1", cls: "bg-green" },
  { name: "green-deep", hex: "#2E7229", note: "Lower lozenge tone. Dark band", cls: "bg-green-deep" },
  { name: "green-ink", hex: "#136509", note: "Link text on light. 5.8:1", cls: "bg-green-ink" },
  { name: "green-light", hex: "#80B076", note: "Link text on dark. 6.0:1", cls: "bg-green-light" },
  { name: "asphalt", hex: "#22272B", note: "Body text, dark sections, the plate", cls: "bg-asphalt" },
  { name: "asphalt-raised", hex: "#2E3236", note: "Card surface on dark", cls: "bg-asphalt-raised" },
  { name: "concrete", hex: "#E9E6E1", note: "Page background", cls: "bg-concrete" },
  { name: "white", hex: "#FFFFFF", note: "Content surfaces", cls: "bg-white" },
  { name: "steel", hex: "#5A6A73", note: "Borders, muted UI, rivets", cls: "bg-steel" },
  { name: "steel-ink", hex: "#4E5C64", note: "Secondary text on light. 5.6:1", cls: "bg-steel-ink" },
  { name: "steel-light", hex: "#9AA2A4", note: "Secondary text on dark. 5.8:1", cls: "bg-steel-light" },
  { name: "rule", hex: "#CACBC9", note: "Hairline on light", cls: "bg-rule" },
  { name: "rule-dark", hex: "#3E4244", note: "Hairline on dark", cls: "bg-rule-dark" },
  { name: "laterite", hex: "#8F3F1E", note: "Secondary accent. 5.8:1", cls: "bg-laterite" },
  { name: "survey", hex: "#E2B236", note: "Fill / rule / focus. Never text on light", cls: "bg-survey" },
];

const TYPE_STEPS = [
  { cls: "text-display wdth-display", label: "display", spec: "41 → 65px · wdth 118 · 800" },
  { cls: "text-h1 wdth-heading", label: "h1", spec: "33 → 52px · wdth 112 · 800" },
  { cls: "text-h2 wdth-heading", label: "h2", spec: "26 → 41px · wdth 112 · 700" },
  { cls: "text-h3 wdth-heading", label: "h3", spec: "21 → 26px · wdth 112 · 700" },
  { cls: "text-xl wdth-heading font-semibold", label: "xl", spec: "26px" },
  { cls: "text-lg wdth-body", label: "lg", spec: "21px · lead" },
  { cls: "text-base wdth-body", label: "base", spec: "17px · body" },
  { cls: "text-sm wdth-body", label: "sm", spec: "15px" },
  { cls: "text-xs wdth-body", label: "xs", spec: "13.6px · meta" },
  { cls: "text-2xs wdth-body", label: "2xs", spec: "12px · plate labels" },
];

function Entry({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-asphalt pt-6">
      <h2 className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body">
        {title}
      </h2>
      {note ? <p className="mt-2 max-w-(--container-measure) text-sm text-steel-ink">{note}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function StyleguidePage() {
  const projects = getProjects();
  const clients = getClients();
  const team = getTeam();
  const facts = getCompanyFacts();
  const waterResources = getService("water-resources");

  const projectsPage = getPage("projects");
  const sectorLabels = new Map(
    (
      projectsPage.sections.find(
        (section) => section.type === "collection" && section.id === "all-projects",
      ) as CollectionSection | undefined
    )?.facets?.map((facet) => [facet.value, facet.label]) ?? [],
  );

  const clientsPage = getPage("clients");
  const clientGroups = (
    clientsPage.sections.find(
      (section) => section.type === "collection" && section.id === "all-clients",
    ) as CollectionSection | undefined
  )?.facets;

  return (
    <>
      <Section tone="concrete">
        <Container>
          <Heading level={1} text="Styleguide" />
          <p className="mt-4 max-w-(--container-measure) text-lg text-steel-ink wdth-body">
            Every token and component in the system. Check this at 360, 768 and 1280.
          </p>
        </Container>
      </Section>

      <Section tone="concrete" className="pt-0!">
        <Container>
          <div className="flex flex-col gap-16">
            <Entry
              title="Colour"
              note="Reconciled against the supplied logo. Every text pair is verified to WCAG AA; survey yellow is a fill, a rule or a focus ring, never text on a light surface."
            >
              <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                {COLOURS.map((colour) => (
                  <li key={colour.name} className="flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className={`size-12 shrink-0 border border-rule ${colour.cls}`}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold wdth-body">{colour.name}</span>
                      <span className="block text-xs text-steel-ink tabular">{colour.hex}</span>
                      <span className="block text-xs text-steel-ink">{colour.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Entry>

            <Entry
              title="Type"
              note="Archivo, one family. Width is the expressive axis: 118 for display, 112 for headings, 100 for body. Scale is 1.25 from a 17px body; display steps are fluid between 360 and 1280."
            >
              <ul className="flex flex-col gap-6">
                {TYPE_STEPS.map((step) => (
                  <li key={step.label} className="border-b border-rule pb-5">
                    <p className="text-2xs uppercase tracking-[0.08em] text-steel-ink">
                      {step.label} · {step.spec}
                    </p>
                    <p className={`mt-2 ${step.cls}`}>Engineering Nigeria&rsquo;s infrastructure</p>
                  </li>
                ))}
              </ul>
            </Entry>

            <Entry title="Buttons" note="Square corners. Primary is brand green; secondary is the laterite outline; inverse is for asphalt sections.">
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-4">
                  <Button label="Contact us" href="/contact" />
                  <Button label="View our projects" href="/projects" variant="secondary" />
                  <Button label="Send enquiry" type="submit" />
                </div>
                <div className="bg-asphalt p-6">
                  <Button label="Contact us" href="/contact" variant="inverse" />
                </div>
                <div className="max-w-sm">
                  <Button label="Full width at 360" href="/contact" block />
                </div>
              </div>
            </Entry>

            <Entry title="Links" note="Underlined, no appended arrow. Laterite on hover.">
              <div className="flex flex-col gap-4">
                <p className="text-base">
                  A line of body copy containing{" "}
                  <TextLink label="a link to the projects index" href="/projects" /> set inline.
                </p>
                <div className="bg-asphalt p-6 text-concrete">
                  <p className="text-base">
                    The same link{" "}
                    <TextLink label="on an asphalt surface" href="/projects" tone="dark" />.
                  </p>
                </div>
              </div>
            </Entry>

            <Entry title="Tags" note="The only rounded shape in the system. Quotes the logo's lozenge.">
              <div className="flex flex-wrap gap-3">
                <Tag label="Water" />
                <Tag label="Buildings" tone="green" />
                <Tag label="HSE" tone="survey" />
                <Tag label="Completed" tone="outline" />
              </div>
            </Entry>

            <Entry title="Breadcrumbs">
              <Breadcrumbs
                trail={[{ label: "Services", href: "/services" }]}
                current="Water Resources"
                label="Breadcrumb"
              />
            </Entry>

            <Entry title="Focus" note="3px survey outline at 2px offset over a 2px asphalt ring. The dark ring carries the contrast; the yellow carries the brand. Tab through the page to see it on every control.">
              <div className="flex flex-wrap gap-4">
                <Button label="Tab to me" href="/contact" />
                <Button label="And me" variant="secondary" href="/projects" />
                <TextLink label="And this link" href="/about" />
              </div>
            </Entry>

            <Entry title="Placeholder" note="Unresolved {{CONFIRM}} copy. Highlighted in development only; production renders the raw text and a later build check blocks the deploy.">
              <p className="text-base">
                <RichText text="Head office: Abeokuta, Ogun State {{CONFIRM: full street address}}" />
              </p>
            </Entry>

            <Entry title="Capability list" note="Hairline schedule. Used as the service page sidebar.">
              <div className="max-w-sm">
                <CapabilityList items={waterResources.capabilities} heading="Capabilities" />
              </div>
            </Entry>

            <Entry title="Project cards" note="Square, hairline border, no shadow. With no photography yet the image slot is replaced by a laterite rule, which reads as deliberate where an empty grey box would read as broken.">
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.slice(0, 3).map((project) => (
                  <li key={project.slug} className="contents">
                    <ProjectCard
                      project={project}
                      sectorLabel={sectorLabels.get(project.sector) ?? project.sector}
                    />
                  </li>
                ))}
              </ul>
            </Entry>

            <Entry title="Client register" note="Typeset, not a logo strip. Sato has no client logo files, and a ministry's name set in type carries more for a procurement reader than a low-resolution GIF.">
              <ClientList clients={clients.slice(0, 7)} groups={clientGroups} />
            </Entry>

            <Entry title="Person card">
              <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {team.slice(0, 3).map((member) => (
                  <li key={member.slug} className="contents">
                    <PersonCard
                      member={member}
                      qualificationsLabel="Qualifications"
                      membershipsLabel="Memberships"
                    />
                  </li>
                ))}
              </ul>
            </Entry>
          </div>
        </Container>
      </Section>

      <Section tone="concrete" className="pt-0!">
        <Container>
          <div className="border-t border-asphalt pt-6">
            <h2 className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body">
              Company at a glance
            </h2>
            <p className="mt-2 max-w-(--container-measure) text-sm text-steel-ink">
              The data plate. A solid asphalt block with a hi-vis bar and four rivets, set as a
              precise tabular list. This is the one thing on Home that should be unmistakable.
            </p>
          </div>
          <CompanyFactsPanel heading="Company at a glance" facts={facts} className="mt-6" />
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <Heading level={2} text="Section tones" />
          <p className="mt-3 max-w-(--container-measure) text-base text-steel-ink wdth-body">
            This band is the white surface. The page default is concrete; asphalt carries the plate
            and the CTA; green-deep is reserved for a single emphasis band.
          </p>
        </Container>
      </Section>

      <Section tone="green">
        <Container>
          <Heading level={2} text="Green band" className="text-white" />
          <p className="mt-3 max-w-(--container-measure) text-base wdth-body">
            Used sparingly, and never behind long-form reading.
          </p>
        </Container>
      </Section>

      <CtaBand
        heading="Talk to our team"
        body="Working on a project in civil, water or energy infrastructure?"
        ctas={[
          { label: "Contact us", href: "/contact" },
          { label: "View our projects", href: "/projects" },
        ]}
        headingId="styleguide-cta"
      />
    </>
  );
}
