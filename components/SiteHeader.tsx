import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { RichText } from "./RichText";
import type { Site } from "@/lib/content-types";

export interface SiteHeaderProps {
  site: Site;
}

export function SiteHeader({ site }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-[var(--header-height)] border-b border-rule bg-concrete">
      <a
        href="#main"
        className="sr-only px-4 py-2 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-asphalt focus:text-concrete"
      >
        <RichText text={site.skipLinkLabel} />
      </a>

      <Container className="flex h-full items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center no-underline">
          <Logo surface="light" alt={site.logoAlt} priority />
        </Link>

        <nav aria-label={site.navLabel} className="hidden lg:block">
          <ul className="flex items-center gap-x-7">
            {site.nav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-asphalt no-underline wdth-body transition-colors duration-150 hover:text-green-ink"
                >
                  <RichText text={link.label} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <MobileNav
          links={site.nav}
          navLabel={site.navLabel}
          openLabel={site.menuOpenLabel}
          closeLabel={site.menuCloseLabel}
        />
      </Container>
    </header>
  );
}
