import { Container } from "./Container";
import { Heading } from "./Heading";
import { RichText } from "./RichText";
import { Section } from "./Section";
import type { ServiceOverview as ServiceOverviewContent } from "@/lib/content-types";

/**
 * The opening statement of a service page, before its sub-nav.
 *
 * Only Oil & Gas has one ("Our consortium"). It sits outside the three
 * template sections because the Oil & Gas sub-nav is held exactly as it is
 * by the client, and this is the deck's first slide: the paragraph that says
 * what the consortium does, then the six points that stand behind it.
 */
export function ServiceOverview({ overview }: { overview: ServiceOverviewContent }) {
  const headingId = `${overview.id}-heading`;

  return (
    <Section tone="paper" id={overview.id} labelledBy={headingId}>
      <Container>
        <Heading level={2} size="h2" text={overview.heading} id={headingId} split />

        {overview.intro.map((paragraph, index) => (
          <p
            key={index}
            data-anim="fade"
            className="mt-6 max-w-[52rem] text-lg leading-relaxed text-asphalt wdth-body text-pretty"
          >
            <RichText text={paragraph} />
          </p>
        ))}

        {overview.items.length ? (
          <ul className="mt-10 grid border-t border-l border-rule sm:grid-cols-2 lg:grid-cols-3">
            {overview.items.map((item, index) => (
              <li
                key={item}
                className="border-r border-b border-rule bg-concrete p-5"
                data-anim="fade"
                data-delay={index * 60}
              >
                <span aria-hidden="true" className="eyebrow tabular text-xs! text-steel-ink">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-base leading-snug wdth-body text-pretty">
                  <RichText text={item} />
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </Section>
  );
}
