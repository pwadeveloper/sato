"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { RichText } from "./RichText";
import { bandHref, bandItems } from "@/lib/service-band";
import { cn } from "@/lib/cn";

export interface ServicesMenuBand {
  group: string;
  label: string;
  /** Landing page for the category, where it has one. */
  href?: string;
  services: Array<{ slug: string; name: string; shortSummary: string }>;
}

export interface ServicesMenuProps {
  label: string;
  href: string;
  bands: ServicesMenuBand[];
  tone: "light" | "dark";
}

/**
 * The Services item in the header: a link that also opens a grouped panel.
 *
 * Built as a disclosure button rather than a hover menu, because a hover-only
 * menu is unreachable by keyboard and unusable by touch. The button carries
 * `aria-expanded` and `aria-controls`; Escape closes and returns focus; a
 * click outside closes. "Services" itself stays a real link in the panel, so
 * the overview page is never stranded behind a menu.
 *
 * Each category heading is itself a destination where it has one, so
 * Infrastructure Services opens its landing page and its four disciplines sit
 * indented beneath it, while Energy and Oil & Gas are single links.
 */
export function ServicesMenu({ label, href, bands, tone }: ServicesMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    }
    function onPointerDown(event: PointerEvent) {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    }
    // Tabbing out of the panel closes it, so the menu never lingers behind.
    function onFocusIn(event: FocusEvent) {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [open]);

  const link =
    tone === "dark"
      ? "text-concrete hover:text-brand-light"
      : "text-asphalt hover:text-brand-ink";

  const headingClass =
    "block border-b border-rule-dark pb-2 text-2xs font-semibold uppercase tracking-[0.08em] text-brand-light wdth-body";

  // The wrapper is full height, so the panel can hang off the bottom of the
  // bar rather than off the middle of the button.
  return (
    <div ref={wrapper} className="relative flex h-full items-center">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 text-sm font-semibold wdth-body",
          "transition-colors duration-150",
          link,
        )}
      >
        <RichText text={label} />
        <span
          aria-hidden="true"
          className={cn(
            "text-[0.6em] leading-none transition-transform duration-150",
            open && "rotate-180",
          )}
        >
          &#9660;
        </span>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="
          absolute right-0 top-full z-50 w-[min(56rem,calc(100vw-3rem))]
          border border-rule-dark bg-asphalt p-6 text-concrete shadow-none
        "
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bands.map((band) => {
            const categoryHref = bandHref(band);
            const items = bandItems(band);
            // A category of one has no sub-items to list. Its row shows the
            // service's summary instead of repeating the category name that
            // is already directly above it.
            const solo = items.length === 0 ? band.services[0] : undefined;

            const rowClass =
              "group flex items-start justify-between gap-3 py-2 text-sm " +
              "text-concrete no-underline wdth-body transition-colors " +
              "duration-150 hover:text-brand-light";

            const arrow = (
              <span
                aria-hidden="true"
                className="shrink-0 leading-6 text-steel-light transition-colors duration-150 group-hover:text-brand-light"
              >
                &rarr;
              </span>
            );

            return (
              <div key={band.group}>
                {categoryHref ? (
                  <Link
                    href={categoryHref}
                    onClick={() => setOpen(false)}
                    className={cn(
                      headingClass,
                      "group flex items-center gap-2 no-underline transition-colors duration-150 hover:text-concrete",
                    )}
                  >
                    <RichText text={band.label} />
                    <span
                      aria-hidden="true"
                      className="text-[0.9em] leading-none transition-transform duration-150 group-hover:translate-x-0.5"
                    >
                      &rarr;
                    </span>
                  </Link>
                ) : (
                  <p className={headingClass}>
                    <RichText text={band.label} />
                  </p>
                )}

                {/* Every category gets a list, so the four columns read the
                    same way and every destination is a row. */}
                <ul className={cn("mt-2", categoryHref && "border-l border-rule-dark pl-3")}>
                  {solo ? (
                    <li>
                      <Link
                        href={`/services/${solo.slug}`}
                        onClick={() => setOpen(false)}
                        className={rowClass}
                      >
                        {/* The row's visible text is the summary, so the
                            link says where it goes to a screen reader too. */}
                        <span>
                          <span className="sr-only">
                            <RichText text={solo.name} />
                            {" — "}
                          </span>
                          <RichText text={solo.shortSummary} />
                        </span>
                        {arrow}
                      </Link>
                    </li>
                  ) : (
                    items.map((service) => (
                      <li key={service.slug}>
                        <Link
                          href={`/services/${service.slug}`}
                          onClick={() => setOpen(false)}
                          className={rowClass}
                        >
                          <span>
                            <RichText text={service.name} />
                          </span>
                          {arrow}
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            );
          })}
        </div>

        <Link
          href={href}
          onClick={() => setOpen(false)}
          className="mt-5 inline-block border-t border-rule-dark pt-4 text-xs font-semibold text-brand-light no-underline underline-offset-[0.2em] wdth-body hover:underline"
        >
          <RichText text={label} />
        </Link>
      </div>
    </div>
  );
}
