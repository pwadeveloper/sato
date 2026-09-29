import Link from "next/link";
import { Container } from "./Container";
import { RichText } from "./RichText";
import type { Site } from "@/lib/content-types";

export interface SiteFooterProps {
  site: Site;
  /** Passed in so the build year is resolved by the caller, not the component. */
  year: number;
}

/**
 * One band: who, and where to go.
 *
 * The previous footer stacked a logo, a nav, a legal line and a copyright
 * line into something taller than most of the content above it. The client's
 * note was that the bottom of every page had become the biggest thing on it,
 * and he is right — a footer is a signpost, not a section.
 *
 * It carried the telephone number and the email address until the client
 * asked for them out: the contact details belong on Contact, which is in the
 * row of links beside them, and repeating them on every page of the site was
 * one more thing to keep in step. `site.phones` and `site.emails` are
 * unchanged and still the single source for the Contact page.
 */
export function SiteFooter({ site, year }: SiteFooterProps) {
  const copyright = site.footer.copyright.replace("{year}", String(year));

  return (
    <footer className="border-t border-rule-dark bg-asphalt text-concrete">
      <Container className="py-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <p className="text-sm text-steel-light tabular wdth-body">
            <RichText text={site.footer.legal} />
            <span className="mx-2 text-rule-dark" aria-hidden="true">
              ·
            </span>
            <RichText text={copyright} />
          </p>

          <nav aria-label={site.footer.navLabel}>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {site.footer.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-concrete no-underline wdth-body transition-colors duration-150 hover:text-brand-light"
                  >
                    <RichText text={link.label} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
