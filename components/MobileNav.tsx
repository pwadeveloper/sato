"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RichText } from "./RichText";
import type { Link as LinkContent } from "@/lib/content-types";

export interface MobileNavProps {
  links: LinkContent[];
  navLabel: string;
  openLabel: string;
  closeLabel: string;
  /** Matches the header it sits in. The open panel is dark either way. */
  tone?: "light" | "dark";
}

/**
 * The only client component in the chrome. Everything else in the header is
 * server-rendered, which keeps the JS on a Nigerian mobile connection to a
 * disclosure toggle and nothing more.
 */
export function MobileNav({
  links,
  navLabel,
  openLabel,
  closeLabel,
  tone = "light",
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
        onClick={() => setIsOpen((open) => !open)}
        className={`-mr-2 flex size-11 items-center justify-center ${
          tone === "dark" ? "text-concrete" : "text-asphalt"
        }`}
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
              {links.map((link) => (
                <li key={link.href} className="border-b border-rule-dark">
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-4 text-xl font-semibold text-concrete no-underline wdth-heading"
                  >
                    <RichText text={link.label} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
