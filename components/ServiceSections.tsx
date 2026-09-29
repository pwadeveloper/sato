import { CapabilityList } from "./CapabilityList";
import { Container } from "./Container";
import { Heading } from "./Heading";
import { ProcurementList } from "./ProcurementList";
import { RegistrationsBlock } from "./RegistrationsBlock";
import { RichText } from "./RichText";
import { Section } from "./Section";
import { SectionNav } from "./SectionNav";
import { ServiceGallery } from "./ServiceGallery";
import { ServiceSectionGroups } from "./ServiceSectionGroups";
import { ServiceListBlock } from "./ServiceListBlock";
import { SolutionsPyramid } from "./SolutionsPyramid";
import { ValueMap } from "./ValueMap";

import type {
  ImageRef,
  ServiceMedia,
  ServiceSection,
  ServiceSectionContent,
  ServiceSections as ServiceSectionsContent,
} from "@/lib/content-types";
import { hasSectionContent } from "@/lib/content";
import type { ReactNode } from "react";

/** The tone each section's band takes, so no two adjacent bands match. */
const TONES = {
  capabilities: "concrete",
  solutions: "white",
  partnerships: "concrete",
} as const;

export interface ServiceSectionsProps {
  content: ServiceSectionsContent;
  /** The derived sub-nav. Sections not in it are not rendered. */
  nav: ServiceSection[];
  /** `labels` from `pages/services.json`. */
  labels: Record<string, string>;
  /** Photographs of delivered work, shown at the foot of Capabilities. */
  gallery?: ImageRef[];
  /** Registrations, in the Capabilities aside. Hidden when empty. */
  registrations?: { heading: string; items: string[] };
  /**
   * Anything the page adds at the foot of a named section — the "See our …
   * projects" link under Capabilities, the related services under
   * Partnerships. Keyed by section id so the template needs no prop per
   * section and no knowledge of what a page wants to put there.
   */
  footers?: Partial<Record<string, ReactNode>>;
}

/**
 * Capabilities · Solutions · Partnerships, for a service page.
 *
 * One template, and nothing in it branches on which service it is rendering.
 * A section appears because `hasSectionContent()` says it holds something;
 * if it does not, there is no band, no `h2`, no `#id` anchor and no item in
 * the sub-nav above. That is why Energy has no Partnerships heading standing
 * over nothing, and why the Digital Twin page will grow a fuller Solutions
 * section the moment the client's own material lands, without a code change.
 *
 * Every heading inside comes from `Heading`: the section is an `h2`, its
 * subsections are `h3`, and a group inside one of those is an `h4`. The
 * before-and-after is `docs/heading-audit.md`.
 */
export function ServiceSections({
  content,
  nav,
  labels,
  gallery = [],
  registrations,
  footers = {},
}: ServiceSectionsProps) {
  const onPage = nav.filter((section) => !section.href);

  return (
    <>
      {nav.length ? (
        <SectionNav sections={nav} label={labels.sectionNav ?? ""} />
      ) : null}

      {onPage.map((section) => {
        const id = section.id as keyof typeof TONES;
        const body = content[id];
        if (!hasSectionContent(body)) return null;

        return (
          <Section
            key={id}
            tone={TONES[id] ?? "concrete"}
            id={id}
            labelledBy={`${id}-heading`}
          >
            <Container>
              <Heading
                level={2}
                size="h2"
                text={section.label}
                id={`${id}-heading`}
              />

              <SectionBody
                content={body}
                id={id}
                labels={labels}
                gallery={id === "capabilities" ? gallery : []}
                registrations={id === "capabilities" ? registrations : undefined}
                footer={footers[id]}
              />
            </Container>
          </Section>
        );
      })}
    </>
  );
}

/**
 * The inside of one section.
 *
 * Two shapes, chosen by the content rather than by a flag: with an aside it
 * is a 7/4 split, without one it runs the full measure. The aside is the
 * narrow column that carries "Also covered" and the registrations panel, and
 * only Oil & Gas has ever had one.
 */
function SectionBody({
  content,
  id,
  labels,
  gallery,
  registrations,
  footer,
}: {
  content: ServiceSectionContent;
  id: string;
  labels: Record<string, string>;
  gallery: ImageRef[];
  registrations?: { heading: string; items: string[] };
  footer?: ReactNode;
}) {
  const showRegistrations = Boolean(registrations?.items.length);
  const hasAside = Boolean(content.aside || showRegistrations);

  const main = (
    <>
      {(content.intro ?? []).map((paragraph, index) => (
        <p
          key={index}
          className="mt-5 max-w-(--container-measure) text-base wdth-body first:mt-0"
        >
          <RichText text={paragraph} />
        </p>
      ))}

      {content.items?.length ? (
        <CapabilityList items={content.items} className="mt-8" />
      ) : null}

      <ServiceSectionGroups
        groups={content.groups ?? []}
        idPrefix={id}
        defaultLinkLabel={labels.viewService}
        className="mt-10"
      />

      {(content.media ?? []).map((block, index) => (
        <MediaBlock
          key={`${block.type}-${index}`}
          block={block}
          headingId={`${id}-${block.type}-${index}`}
        />
      ))}

      {/* Photographs of delivered work, where the client has sent any.
          Empty on every service today; see docs/adding-client-photos.md. */}
      <ServiceGallery
        images={gallery}
        heading={labels.gallery ?? ""}
        headingId={`${id}-gallery`}
        headingLevel={3}
        className="mt-12"
      />

      {footer}
    </>
  );

  if (!hasAside) return <div className="mt-8">{main}</div>;

  return (
    <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-7">{main}</div>

      <div className="lg:col-span-4 lg:col-start-9">
        {content.aside ? (
          <ServiceListBlock
            list={content.aside}
            headingId={`${id}-aside`}
            headingLevel={3}
          />
        ) : null}

        {showRegistrations && registrations ? (
          <RegistrationsBlock
            heading={registrations.heading}
            items={registrations.items}
            headingId={`${id}-registrations`}
            headingLevel={3}
            className="mt-10"
          />
        ) : null}
      </div>
    </div>
  );
}

/** One `h3`-headed block after the groups: a list, or one of the diagrams. */
function MediaBlock({
  block,
  headingId,
}: {
  block: ServiceMedia;
  headingId: string;
}) {
  switch (block.type) {
    case "list":
      return (
        <ServiceListBlock
          list={block}
          headingId={headingId}
          headingLevel={3}
          variant="dense"
          className="mt-12"
        />
      );
    case "pyramid":
      return (
        <SolutionsPyramid
          pyramid={block}
          headingId={headingId}
          headingLevel={3}
          className="mt-12"
        />
      );
    case "valueMap":
      return (
        <ValueMap
          map={block}
          headingId={headingId}
          headingLevel={3}
          className="mt-12"
        />
      );
    case "procurement":
      return (
        <ProcurementList
          block={block}
          headingId={headingId}
          headingLevel={3}
          className="mt-12"
        />
      );
  }
}
