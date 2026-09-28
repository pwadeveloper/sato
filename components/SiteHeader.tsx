"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { NavMenu, type NavMenuGroup } from "./NavMenu";
import { RichText } from "./RichText";
import type { Link as LinkContent } from "@/lib/content-types";
import { cn } from "@/lib/cn";

/** A nav item that opens a panel instead of going straight to its page. */
export interface HeaderMenu {
  /** Matches the nav link's `href`, which is how the two are paired up. */
  href: string;
  overviewLabel: string;
  groups: NavMenuGroup[];
}

export interface SiteHeaderProps {
  logoAlt: string;
  navLabel: string;
  nav: LinkContent[];
  skipLinkLabel: string;
  menuOpenLabel: string;
  menuCloseLabel: string;
  menus: HeaderMenu[];
}

/** True for the item covering the current page — `/` only ever matches itself. */
function isCurrent(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * The bar. One solid surface on every route.
 *
 * It used to sit transparently over the Home hero and take a background once
 * that was scrolled past. Home no longer has white copy over a full-bleed
 * photograph, so the observer that drove it is gone with it — the header is
 * plain, which is what the client asked the whole site to be.
 */
export function SiteHeader({
  logoAlt,
  navLabel,
  nav,
  skipLinkLabel,
  menuOpenLabel,
  menuCloseLabel,
  menus,
}: SiteHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 h-[var(--header-height)] border-b border-rule bg-concrete">
      <a
        href="#main"
        className="sr-only px-4 py-2 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-asphalt focus:text-concrete"
      >
        <RichText text={skipLinkLabel} />
      </a>

      <Container className="flex h-full items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center no-underline">
          <Logo alt={logoAlt} priority />
        </Link>

        <nav aria-label={navLabel} className="hidden h-full lg:block">
          <ul className="flex h-full items-center gap-x-5 xl:gap-x-7">
            {nav.map((link) => {
              const menu = menus.find((entry) => entry.href === link.href);
              const current = isCurrent(pathname, link.href);

              return (
                <li key={link.href} className={menu ? "h-full" : undefined}>
                  {menu ? (
                    <NavMenu
                      label={link.label}
                      href={link.href}
                      overviewLabel={menu.overviewLabel}
                      groups={menu.groups}
                      current={current}
                    />
                  ) : (
                    <Link
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "text-sm font-semibold no-underline wdth-body transition-colors duration-150 hover:text-brand-ink",
                        current ? "text-brand-ink" : "text-asphalt",
                      )}
                    >
                      <RichText text={link.label} />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <MobileNav
          links={nav}
          menus={menus}
          navLabel={navLabel}
          openLabel={menuOpenLabel}
          closeLabel={menuCloseLabel}
        />
      </Container>
    </header>
  );
}
