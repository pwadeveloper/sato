import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { RichText } from "./RichText";
import type { Site } from "@/lib/content-types";

export interface SiteFooterProps {
  site: Site;
  /** Passed in so the build year is resolved by the caller, not the component. */
  year: number;
}

export function SiteFooter({ site, year }: SiteFooterProps) {
  const copyright = site.footer.copyright.replace("{year}", String(year));

  return (
    <footer className="bg-asphalt text-concrete">
      <Container className="section-y">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <Logo surface="dark" alt={site.logoAlt} sizeClassName="h-11 md:h-12" />

          <nav aria-label={site.footer.navLabel}>
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
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

        <div className="mt-12 border-t border-rule-dark pt-6">
          <p className="max-w-(--container-measure) text-sm text-steel-light wdth-body">
            <RichText text={site.footer.legal} />
          </p>
          <p className="mt-3 text-sm text-steel-light tabular wdth-body">
            <RichText text={copyright} />
          </p>
        </div>
      </Container>
    </footer>
  );
}
