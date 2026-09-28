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
 * One band: who, where to go, how to reach us.
 *
 * The previous footer stacked a logo, a nav, a legal line and a copyright
 * line into something taller than most of the content above it. The client's
 * note was that the bottom of every page had become the biggest thing on it,
 * and he is right — a footer is a signpost, not a section. This is three
 * groups on one row on desktop (under 120px tall) and three short lines on a
 * phone.
 *
 * Contact details come from `site.phones` and `site.emails`, which hold
 * exactly one entry each; `check:banned` fails the build on any other number
 * or address reaching the exported site.
 */
export function SiteFooter({ site, year }: SiteFooterProps) {
  const copyright = site.footer.copyright.replace("{year}", String(year));
  const phone = site.phones[0];
  const email = site.emails[0];

  return (
    <footer className="border-t border-rule-dark bg-asphalt text-concrete">
      <Container className="py-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
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

          <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-steel-light wdth-body">
            {phone ? (
              <a
                href={phone.href}
                className="tabular text-concrete no-underline transition-colors duration-150 hover:text-brand-light"
              >
                <RichText text={phone.value} />
              </a>
            ) : null}
            {email ? (
              <a
                href={email.href}
                className="text-concrete no-underline transition-colors duration-150 hover:text-brand-light"
              >
                <RichText text={email.value} />
              </a>
            ) : null}
          </p>
        </div>
      </Container>
    </footer>
  );
}
