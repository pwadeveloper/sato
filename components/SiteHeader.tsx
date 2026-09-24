"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { RichText } from "./RichText";
import type { Link as LinkContent } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface SiteHeaderProps {
  logoAlt: string;
  navLabel: string;
  nav: LinkContent[];
  skipLinkLabel: string;
  menuOpenLabel: string;
  menuCloseLabel: string;
}

/**
 * Routes whose hero is a dark field. The header takes the same tone there so
 * the nav reads as part of the hero rather than a bar laid over it, and stays
 * dark once scrolled — a header that changed colour mid-scroll would need to
 * watch the scroll position, which is more machinery than this earns.
 *
 * Only the pathname crosses to the client; the rest of `site.json` stays on
 * the server.
 */
const DARK_ROUTES = new Set(["/"]);

export function SiteHeader({
  logoAlt,
  navLabel,
  nav,
  skipLinkLabel,
  menuOpenLabel,
  menuCloseLabel,
}: SiteHeaderProps) {
  const isDark = DARK_ROUTES.has(usePathname());

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-[var(--header-height)] border-b",
        isDark ? "border-rule-dark bg-asphalt" : "border-rule bg-concrete",
      )}
    >
      <a
        href="#main"
        className="sr-only px-4 py-2 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-asphalt focus:text-concrete"
      >
        <RichText text={skipLinkLabel} />
      </a>

      <Container className="flex h-full items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center no-underline">
          <Logo surface={isDark ? "dark" : "light"} alt={logoAlt} priority />
        </Link>

        <nav aria-label={navLabel} className="hidden lg:block">
          <ul className="flex items-center gap-x-7">
            {nav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "text-sm font-medium no-underline wdth-body transition-colors duration-150",
                    isDark
                      ? "text-concrete hover:text-green-light"
                      : "text-asphalt hover:text-green-ink",
                  )}
                >
                  <RichText text={link.label} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <MobileNav
          links={nav}
          navLabel={navLabel}
          openLabel={menuOpenLabel}
          closeLabel={menuCloseLabel}
          tone={isDark ? "dark" : "light"}
        />
      </Container>
    </header>
  );
}
