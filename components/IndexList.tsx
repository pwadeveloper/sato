"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { RichText } from "./RichText";
import type { ImageRef, Link as LinkContent } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface IndexListItem {
  id: string;
  label: string;
  href: string;
  intro?: string;
  image?: ImageRef;
  /** Destinations inside the item — Infrastructure's four disciplines. */
  links?: LinkContent[];
}

export interface IndexListProps {
  items: IndexListItem[];
  /** Labels the list for assistive tech. */
  label: string;
  className?: string;
}

/**
 * An index with a picture that follows the pointer.
 *
 * The rows are the content: number, name, one line, and the destinations
 * inside. The photograph on the right belongs to whichever row is under the
 * pointer or has focus, crossfading as that changes — so a reader scanning
 * five areas of work sees the work, not five identical cards. A row with no
 * photograph of its own shows its name set large on the drawing instead,
 * which is honest: there is no picture of that work yet.
 *
 * Below `lg` the panel is gone and each row carries its own picture, so a
 * phone gets the same pictures without hovering anything.
 */
export function IndexList({ items, label, className }: IndexListProps) {
  const [active, setActive] = useState(items[0]?.id ?? null);
  const current = items.find((item) => item.id === active) ?? items[0];

  return (
    <div className={cn("lg:grid lg:grid-cols-12 lg:gap-x-12", className)}>
      <ol aria-label={label} className="border-t border-asphalt lg:col-span-7">
        {items.map((item, index) => {
          const isActive = item.id === current?.id;
          return (
            <li
              key={item.id}
              data-reveal=""
              style={{ "--reveal-stagger": `${index * 5}%`, "--reveal-delay": `${index * 70}ms` } as React.CSSProperties}
              onPointerEnter={() => setActive(item.id)}
              onFocus={() => setActive(item.id)}
              className="group border-b border-rule"
            >
              <div className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-6 md:grid-cols-[3.5rem_1fr] md:py-8">
                <span
                  aria-hidden="true"
                  className={cn(
                    "eyebrow tabular pt-2 transition-colors duration-300",
                    isActive ? "text-brand-ink" : "text-steel",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <h3 className="text-h2 wdth-heading text-balance">
                    <Link
                      href={item.href}
                      className={cn(
                        "inline-flex items-baseline gap-4 no-underline transition-colors duration-300",
                        isActive ? "text-asphalt" : "text-asphalt/85",
                      )}
                    >
                      <RichText text={item.label} />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "inline-block text-[0.55em] text-brand transition-all duration-500 ease-(--ease-out-expo) motion-reduce:transition-none",
                          isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
                        )}
                      >
                        &rarr;
                      </span>
                    </Link>
                  </h3>

                  {item.intro ? (
                    <p className="mt-3 max-w-(--container-measure) text-base text-steel-ink wdth-body text-pretty">
                      <RichText text={item.intro} />
                    </p>
                  ) : null}

                  {item.links?.length ? (
                    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                      {item.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="eyebrow link-draw text-brand-ink transition-colors duration-150 hover:text-brand-deep"
                          >
                            <RichText text={link.label} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {item.image ? (
                    <div className="relative mt-6 aspect-16/9 w-full overflow-hidden bg-steel/10 lg:hidden">
                      <Image
                        src={item.image.src}
                        alt={item.image.alt}
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* The following picture. Sticky so it stays beside the row in hand. */}
      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-[calc(var(--header-height)+2rem)]">
          <div className="relative aspect-4/5 w-full overflow-hidden bg-paper dot-grid">
            <AnimatePresence initial={false}>
              {current ? (
                <m.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                  aria-hidden="true"
                >
                  {current.image ? (
                    <Image
                      src={current.image.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col justify-between p-8">
                      <span className="eyebrow text-steel-ink">
                        {String(items.findIndex((item) => item.id === current.id) + 1).padStart(2, "0")}
                      </span>
                      <span className="text-h1 wdth-display text-balance text-steel/70">
                        <RichText text={current.label} />
                      </span>
                    </div>
                  )}
                </m.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
