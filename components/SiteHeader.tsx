"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { RichText } from "./RichText";
import { ServicesMenu, type ServicesMenuBand } from "./ServicesMenu";
import type { Link as LinkContent } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface SiteHeaderProps {
  logoAlt: string;
  navLabel: string;
  nav: LinkContent[];
  skipLinkLabel: string;
  menuOpenLabel: string;
  menuCloseLabel: string;
  /** Divisions grouped for the Services panel. */
  serviceBands: ServicesMenuBand[];
}

/**
 * Routes that open with a full-bleed photographic hero. There the header sits
 * transparently over the picture, and takes a solid background once the hero
 * has been scrolled past so the nav never sits unreadably on pale content.
 *
 * Only the pathname crosses to the client; the rest of `site.json` stays on
 * the server.
 */
const BLEED_ROUTES = new Set(["/"]);

export function SiteHeader({
  logoAlt,
  navLabel,
  nav,
  skipLinkLabel,
  menuOpenLabel,
  menuCloseLabel,
  serviceBands,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const overHero = BLEED_ROUTES.has(pathname);
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    if (!overHero) return;
    const hero = document.querySelector('[data-hero="bleed"]');
    if (!hero) return;

    // Watching the hero itself beats a scroll handler: the browser does the
    // work, and the switch lands exactly when the picture leaves the bar.
    // rootMargin only understands px and %, never rem — hence offsetHeight
    // rather than the --header-height custom property.
    const bar = document.querySelector("header")?.offsetHeight ?? 64;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPast(!entry.isIntersecting),
      { rootMargin: `-${bar}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [overHero, pathname]);

  // Light ink whenever the bar is over the photograph or on the dark fill.
  const isDark = overHero;
  const isTransparent = overHero && !scrolledPast;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-[var(--header-height)] border-b",
        "transition-[background-color,border-color] duration-300 motion-reduce:transition-none",
        isTransparent
          ? "border-transparent bg-transparent"
          : isDark
            ? "border-rule-dark bg-asphalt"
            : "border-rule bg-concrete",
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
            {nav.map((link) =>
              link.href === "/services" && serviceBands.length ? (
                <li key={link.href}>
                  <ServicesMenu
                    label={link.label}
                    href={link.href}
                    bands={serviceBands}
                    tone={isDark ? "dark" : "light"}
                  />
                </li>
              ) : (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm font-medium no-underline wdth-body transition-colors duration-150",
                      isDark
                        ? "text-concrete hover:text-brand-light"
                        : "text-asphalt hover:text-brand-ink",
                    )}
                  >
                    <RichText text={link.label} />
                  </Link>
                </li>
              ),
            )}
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
