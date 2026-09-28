"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RichText } from "./RichText";
import type { HeaderMenu } from "./SiteHeader";
import type { Link as LinkContent } from "@/lib/content-types";

export interface MobileNavProps {
  links: LinkContent[];
  /** Same panels as the desktop bar, opened in place rather than as a drop. */
  menus: HeaderMenu[];
  navLabel: string;
  openLabel: string;
  closeLabel: string;
}

/**
 * The phone nav. One panel, everything reachable.
 *
 * Services and Projects expand in place instead of pushing the visitor
 * through an intermediate page: tapping the row's caret opens its list, and
 * tapping the row's label still goes to the overview. Open by default is
 * wrong here — six sections and their children would be a page of links
 * before the visitor has asked for any of them.
 */
export function MobileNav({
  links,
  menus,
  navLabel,
  openLabel,
  closeLabel,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeAll = () => {
    setIsOpen(false);
    setExpanded(null);
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
        onClick={() => setIsOpen((open) => !open)}
        className="-mr-2 flex size-11 items-center justify-center text-asphalt"
      >
        <span className="sr-only">
          <RichText text={isOpen ? closeLabel : openLabel} />
        </span>
        <span aria-hidden="true" className="relative block h-4 w-6">
          <span
            className={`absolute left-0 block h-0.5 w-6 bg-current transition-transform duration-150 ${
              isOpen ? "top-[7px] rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute left-0 top-[7px] block h-0.5 w-6 bg-current transition-opacity duration-150 ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 block h-0.5 w-6 bg-current transition-transform duration-150 ${
              isOpen ? "top-[7px] -rotate-45" : "top-[14px]"
            }`}
          />
        </span>
      </button>

      {isOpen ? (
        <div
          id="mobile-nav-panel"
          className="fixed inset-x-0 bottom-0 top-[var(--header-height)] z-50 overflow-y-auto bg-asphalt"
        >
          <nav aria-label={navLabel} className="px-5 py-6">
            <ul className="flex flex-col">
              {links.map((link) => {
                const menu = menus.find((entry) => entry.href === link.href);
                const isExpanded = expanded === link.href;

                return (
                  <li key={link.href} className="border-b border-rule-dark">
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={link.href}
                        onClick={closeAll}
                        className="block flex-1 py-4 text-xl font-semibold text-concrete no-underline wdth-heading"
                      >
                        <RichText text={link.label} />
                      </Link>

                      {menu ? (
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={`mobile-nav-${menu.href.slice(1)}`}
                          onClick={() =>
                            setExpanded(isExpanded ? null : link.href)
                          }
                          className="flex size-11 shrink-0 items-center justify-center text-concrete"
                        >
                          <span className="sr-only">
                            <RichText text={link.label} />
                          </span>
                          <span
                            aria-hidden="true"
                            className={`text-xs leading-none transition-transform duration-150 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          >
                            &#9660;
                          </span>
                        </button>
                      ) : null}
                    </div>

                    {menu ? (
                      <ul
                        id={`mobile-nav-${menu.href.slice(1)}`}
                        hidden={!isExpanded}
                        className="border-l border-rule-dark pb-4 pl-4"
                      >
                        {menu.groups.map((group) => (
                          <li key={group.id}>
                            {group.href ? (
                              <Link
                                href={group.href}
                                onClick={closeAll}
                                className="block py-2.5 text-base font-semibold text-brand-light no-underline wdth-body"
                              >
                                <RichText text={group.label} />
                              </Link>
                            ) : (
                              <p className="py-2.5 text-base font-semibold text-brand-light wdth-body">
                                <RichText text={group.label} />
                              </p>
                            )}

                            {group.items?.length ? (
                              <ul className="border-l border-rule-dark pl-4">
                                {group.items.map((item) => (
                                  <li key={item.href}>
                                    <Link
                                      href={item.href}
                                      onClick={closeAll}
                                      className="block py-2.5 text-sm text-concrete no-underline wdth-body"
                                    >
                                      <RichText text={item.label} />
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
