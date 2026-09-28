"use client";

import { useEffect, useState } from "react";
import { RichText } from "./RichText";
import { Container } from "./Container";
import type { ServiceSection } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface SectionNavProps {
  sections: ServiceSection[];
  label: string;
}

/**
 * The sticky sub-nav on a page long enough to need one.
 *
 * Plain anchors, so it works before any JavaScript runs and works with none
 * at all — `scroll-padding-top` in globals.css already keeps the target
 * clear of the site header. The only thing script adds is which section you
 * are currently in, which is a convenience, not the function.
 *
 * `IntersectionObserver` rather than a scroll handler: the browser does the
 * work off the main thread, and the marker lands on the section that is
 * actually under the bar instead of one computed from an offset.
 */
export function SectionNav({ sections, label }: SectionNavProps) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    // A section that links off the page has no target here to observe, and
    // must never take the current-section marker.
    const targets = sections
      .filter((section) => !section.href)
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (!targets.length) return;

    const seen = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) seen.set(entry.target.id, entry.isIntersecting);
        // The first section still on screen wins, so scrolling up marks the
        // section you are arriving at rather than the one you are leaving.
        const current = sections.find((section) => seen.get(section.id));
        if (current) setActive(current.id);
      },
      // Discount the sticky header and the sub-nav itself from the viewport.
      { rootMargin: "-25% 0px -55% 0px", threshold: 0 },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label={label}
      className="sticky top-[var(--header-height)] z-30 border-y border-rule bg-concrete/95 backdrop-blur-sm"
    >
      <Container>
        <ul className="-mx-1 flex gap-x-1 overflow-x-auto py-1">
          {sections.map((section) => (
            <li key={section.id} className="shrink-0">
              <a
                href={section.href ?? `#${section.id}`}
                aria-current={active === section.id ? "true" : undefined}
                className={cn(
                  "block px-3 py-3 text-sm font-semibold no-underline wdth-body transition-colors duration-150",
                  "border-b-[3px] hover:text-brand-ink",
                  active === section.id
                    ? "border-brand text-brand-ink"
                    : "border-transparent text-steel-ink",
                )}
              >
                <RichText text={section.label} />
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  );
}
