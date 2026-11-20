import Link from "next/link";

import { Container } from "./Container";
import { RichText } from "./RichText";
import { getSite } from "@/lib/content";
import type { HoldingId } from "@/lib/content-types";

export interface HoldingSwitchProps {
  /** The holding the page belongs to. */
  current: HoldingId;
  /** Whether the page is a services page or a projects page. */
  kind: "services" | "projects";
}

/**
 * The strip that links one holding to the other.
 *
 * Infrastructure and Oil & Gas are the company's two halves, and a reader on
 * one had to go back to Home to reach the other (review, 20 November). So
 * every page that belongs to one of them opens with this strip: which holding
 * the reader is in, and a button to the other — to its services from a
 * services page, to its projects from a projects page — with a quieter link
 * to the other kind beside it.
 *
 * It sits directly under the site header, on the page rather than fixed,
 * because service pages already carry a sticky sub-nav and two sticky bars
 * would take a phone screen's worth of height. Every word comes from
 * `site.holdings`.
 */
export function HoldingSwitch({ current, kind }: HoldingSwitchProps) {
  const { holdings } = getSite();
  const here = holdings.items.find((item) => item.id === current);
  const other = holdings.items.find((item) => item.id !== current);
  if (!here || !other) return null;

  const primaryHref = kind === "services" ? other.servicesHref : other.projectsHref;
  const secondaryHref = kind === "services" ? other.projectsHref : other.servicesHref;
  const secondaryLabel = kind === "services" ? holdings.projectsLabel : holdings.servicesLabel;

  return (
    <nav aria-label={holdings.label} className="border-b border-rule bg-brand-tint">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
        <p className="text-sm text-steel-ink wdth-body">
          <span className="eyebrow mr-2 text-steel-ink">
            <RichText text={holdings.currentLabel} />
          </span>
          <span className="font-semibold text-asphalt" aria-current="true">
            <RichText text={here.label} />
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href={primaryHref}
            className="group inline-flex items-center gap-2 bg-brand px-4 py-2.5 text-sm font-bold text-white no-underline wdth-body transition-colors duration-150 hover:bg-brand-deep"
          >
            <span>
              <RichText text={`${holdings.switchLabel} ${other.label}`} />
            </span>
            <span
              aria-hidden="true"
              className="transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
            >
              &rarr;
            </span>
          </Link>
          <Link
            href={secondaryHref}
            className="text-sm font-semibold text-brand-ink underline decoration-1 decoration-brand-ink/40 underline-offset-[0.2em] wdth-body hover:text-brand-deep"
          >
            <RichText text={`${other.label} ${secondaryLabel.toLowerCase()}`} />
          </Link>
        </div>
      </Container>
    </nav>
  );
}
