"use client";

import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

export interface NavMenuItem {
  label: string;
  href: string;
}

/**
 * One column of the panel. A group with its own page links its heading; a
 * group with no `items` is a single destination and its heading carries the
 * link on its own.
 */
export interface NavMenuGroup {
  id: string;
  label: string;
  href?: string;
  items?: NavMenuItem[];
}

export interface NavMenuProps {
  label: string;
  /** The section's own overview page, linked at the foot of the panel. */
  href: string;
  overviewLabel: string;
  groups: NavMenuGroup[];
  /** Marks the trigger when the visitor is already inside this section. */
  current?: boolean;
}

/**
 * A nav item that is also a disclosure, opened by click.
 *
 * Both Services and Projects use this. The client asked for click rather than
 * hover, which is also the only version that works: a hover menu cannot be
 * opened by touch, and on a trackpad it opens itself on the way past.
 *
 * Every sub-item is shown at once — there is no second level to hunt for.
 * The trigger is a real `<button>` with `aria-expanded`, so Enter and Space
 * come free; Arrow keys walk the panel, Escape and Tab-out close it, and
 * closing puts focus back on the trigger rather than dropping it to the top
 * of the document.
 *
 * The panel is the drawing: asphalt with the survey grid, each group indexed
 * in the mono. It enters with a short rise and leaves faster than it came.
 */
export function NavMenu({
  label,
  href,
  overviewLabel,
  groups,
  current = false,
}: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) button.current?.focus();
  }, []);

  /** Every link in the panel, in reading order — the roving focus ring. */
  const links = useCallback(
    () => Array.from(panel.current?.querySelectorAll("a") ?? []),
    [],
  );

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
        return;
      }

      const all = links();
      if (!all.length) return;
      const at = all.indexOf(document.activeElement as HTMLAnchorElement);

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          all[at < 0 ? 0 : (at + 1) % all.length]?.focus();
          break;
        case "ArrowUp":
          event.preventDefault();
          all[at <= 0 ? all.length - 1 : at - 1]?.focus();
          break;
        case "Home":
          if (at < 0) return;
          event.preventDefault();
          all[0]?.focus();
          break;
        case "End":
          if (at < 0) return;
          event.preventDefault();
          all[all.length - 1]?.focus();
          break;
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (!wrapper.current?.contains(event.target as Node)) close(false);
    }
    // Tabbing past the last item closes the panel rather than leaving it
    // hanging open behind the rest of the bar.
    function onFocusIn(event: FocusEvent) {
      if (!wrapper.current?.contains(event.target as Node)) close(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [open, close, links]);

  const rowClass =
    "group flex items-start justify-between gap-4 py-2 text-sm text-concrete " +
    "no-underline wdth-body transition-colors duration-150 hover:text-brand-light";

  const arrow = (
    <span
      aria-hidden="true"
      className="shrink-0 leading-6 text-steel-light transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-1 group-hover:text-brand-light motion-reduce:transition-none"
    >
      &rarr;
    </span>
  );

  return (
    <div ref={wrapper} className="relative flex h-full items-center">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-current={current ? "page" : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          // ArrowDown opens the panel. Moving into it is left to the document
          // handler below, which sees focus still on the trigger and takes
          // that as "before the first item" — doing it here as well would
          // fire both on one press and step over the first link.
          if (event.key !== "ArrowDown" || open) return;
          event.preventDefault();
          setOpen(true);
        }}
        className={cn(
          "eyebrow link-draw flex items-center gap-2 py-2",
          "transition-colors duration-150 hover:text-brand-ink",
          current ? "text-brand-ink [background-size:100%_1px]" : "text-asphalt",
          open && "text-brand-ink",
        )}
      >
        <RichText text={label} />
        <span
          aria-hidden="true"
          className={cn(
            "text-[0.55em] leading-none transition-transform duration-300 ease-(--ease-out-expo)",
            open && "rotate-180",
          )}
        >
          &#9660;
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            ref={panel}
            id={panelId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              // Anchored to the trigger's right edge so it can never run off the
              // side of the window, and only as wide as its contents need.
              "absolute right-0 top-full z-50 border border-rule-dark bg-asphalt p-7 text-concrete dot-grid-dark",
              groups.length > 3
                ? "w-[min(60rem,calc(100vw-3rem))]"
                : "w-[min(24rem,calc(100vw-3rem))]",
            )}
          >
            <div
              className={cn(
                // CSS columns rather than a grid: these headings are four and
                // five words long, and a five-track grid gives each about 160px,
                // which wraps "Research, Technology & Innovation Services" onto
                // four lines. Columns let each group take the height it needs
                // and pack the rest around it.
                groups.length > 3 && "lg:columns-3 lg:gap-10",
              )}
            >
              {groups.map((group, index) => {
                const items = group.items ?? [];
                const number = (
                  <span aria-hidden="true" className="tabular text-steel-light">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                );

                return (
                  <div key={group.id} className="mb-7 break-inside-avoid last:mb-0">
                    {group.href ? (
                      <Link
                        href={group.href}
                        onClick={() => close(false)}
                        className="group eyebrow flex items-baseline gap-3 border-b border-rule-dark pb-2.5 text-brand-light no-underline transition-colors duration-150 hover:text-concrete"
                      >
                        {number}
                        <span className="flex-1">
                          <RichText text={group.label} />
                        </span>
                        <span
                          aria-hidden="true"
                          className="text-[0.95em] leading-none transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-1 motion-reduce:transition-none"
                        >
                          &rarr;
                        </span>
                      </Link>
                    ) : (
                      <p className="eyebrow flex items-baseline gap-3 border-b border-rule-dark pb-2.5 text-brand-light">
                        {number}
                        <RichText text={group.label} />
                      </p>
                    )}

                    {items.length ? (
                      <ul className="mt-2 border-l border-rule-dark pl-4">
                        {items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => close(false)}
                              className={rowClass}
                            >
                              <span>
                                <RichText text={item.label} />
                              </span>
                              {arrow}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <Link
              href={href}
              onClick={() => close(false)}
              className="eyebrow link-draw mt-6 inline-block border-t border-rule-dark pt-4 text-brand-light"
            >
              <RichText text={overviewLabel} />
            </Link>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
