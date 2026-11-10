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
 *
 * The nav is set in the mono, like the labels on a drawing: small,
 * uppercase, letterspaced. The current section carries a brand underline
 * rather than only a change of colour.
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
    <header className="sticky top-0 z-40 h-(--header-height) border-b border-rule/70 bg-concrete/85 backdrop-blur-xl backdrop-saturate-150">
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
          <ul className="flex h-full items-center gap-x-7 xl:gap-x-9">
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
                  ) : link.href === "/contact" ? (
                    /* The one action in the bar, set as a button, as the
                       references set their sign-in: it is where a
                       verifying reader is going. */
                    <Link
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      className="eyebrow inline-flex h-10 items-center bg-asphalt px-5 text-white no-underline transition-colors duration-300 hover:bg-brand"
                    >
                      <RichText text={link.label} />
                    </Link>
                  ) : (
                    <Link
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "eyebrow link-draw py-2 transition-colors duration-150 hover:text-asphalt",
                        current ? "text-asphalt [background-size:100%_1px]" : "text-steel-ink",
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
