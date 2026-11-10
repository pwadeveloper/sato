"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RichText } from "./RichText";
import type { ImageRef, Link as LinkContent } from "@/lib/content-types";
import { getGsap, motionEnabled } from "@/lib/gsap";
import { cn } from "@/lib/cn";

export interface ServicesIndexItem {
  id: string;
  label: string;
  href: string;
  intro?: string;
  image?: ImageRef;
  /** Destinations inside the item — Infrastructure's four disciplines. */
  links?: LinkContent[];
}

export interface ServicesIndexProps {
  items: ServicesIndexItem[];
  label: string;
  className?: string;
}

/**
 * The areas of work as an index, with the photograph following the pointer.
 *
 * Each row is the content: number, name, one line, and the destinations
 * inside. On a desktop with a pointer, the row's photograph floats beside
 * the cursor while the row is hovered — one fixed frame, moved with GSAP's
 * `quickTo`, crossfading between rows — so a reader running down the list
 * sees the work without leaving it. A row without a photograph of its own
 * shows none: there is no picture of that work yet.
 *
 * On touch, each row carries its photograph inline instead.
 */
export function ServicesIndex({ items, label, className }: ServicesIndexProps) {
  const list = useRef<HTMLOListElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const current = items.find((item) => item.id === active && item.image);

  useEffect(() => {
    if (!motionEnabled() || !float.current || !list.current) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const { gsap } = getGsap();
    const el = float.current;
    const x = gsap.quickTo(el, "x", { duration: 0.7, ease: "expo.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.7, ease: "expo.out" });
    const r = gsap.quickTo(el, "rotation", { duration: 0.9, ease: "expo.out" });
    let lastX = 0;

    const onMove = (event: PointerEvent) => {
      x(event.clientX + 28);
      y(event.clientY - 140);
      r(gsap.utils.clamp(-8, 8, (event.clientX - lastX) * 0.4));
      lastX = event.clientX;
    };
    const node = list.current;
    node.addEventListener("pointermove", onMove);
    return () => node.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <ol
        ref={list}
        aria-label={label}
        onPointerLeave={() => setActive(null)}
        className="border-t border-asphalt/15"
      >
        {items.map((item, index) => (
          <li
            key={item.id}
            onPointerEnter={() => setActive(item.id)}
            className="group relative border-b border-asphalt/15"
          >
            <div className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-8 md:grid-cols-[4rem_1fr_auto] md:py-10 lg:grid-cols-[5rem_minmax(0,1.1fr)_minmax(0,0.9fr)_auto] lg:items-baseline lg:gap-x-10">
              <span aria-hidden="true" className="eyebrow tabular pt-3 text-steel transition-colors duration-500 group-hover:text-brand-ink">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3 className="font-display text-[clamp(2rem,1.3rem+2.6vw,3.75rem)] font-normal leading-none tracking-[-0.02em] text-balance">
                <Link
                  href={item.href}
                  className="inline-block text-asphalt no-underline transition-transform duration-700 ease-(--ease-out-expo) group-hover:translate-x-3 motion-reduce:transform-none"
                >
                  <RichText text={item.label} />
                  <span className="absolute inset-0" aria-hidden="true" />
                </Link>
              </h3>

              <div className="col-start-2 mt-4 md:col-span-1 lg:col-start-3 lg:mt-0">
                {item.intro ? (
                  <p className="max-w-[44ch] text-base text-steel-ink text-pretty">
                    <RichText text={item.intro} />
                  </p>
                ) : null}
                {item.links?.length ? (
                  <ul className="relative z-10 mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {item.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="eyebrow link-draw inline-block py-1.5 text-asphalt transition-colors hover:text-brand-ink">
                          <RichText text={link.label} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {item.image ? (
                  <div className="relative mt-6 aspect-16/10 w-full overflow-hidden rounded-(--radius-frame) md:hidden">
                    <Image src={item.image.src} alt={item.image.alt} fill sizes="100vw" className="object-cover" />
                  </div>
                ) : null}
              </div>

              <span
                aria-hidden="true"
                className="hidden size-12 items-center justify-center self-center rounded-full border border-asphalt/15 text-asphalt transition-all duration-500 ease-(--ease-out-expo) group-hover:border-asphalt group-hover:bg-asphalt group-hover:text-white md:flex"
              >
                &rarr;
              </span>
            </div>
          </li>
        ))}
      </ol>

      {/* The following photograph. Decorative: every row has its own alt inline. */}
      <div
        ref={float}
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-30 hidden h-[17rem] w-[13rem] overflow-hidden rounded-(--radius-frame) shadow-2xl shadow-black/25 transition-[opacity,scale] duration-500 ease-(--ease-out-expo) [@media(hover:hover)_and_(pointer:fine)]:block xl:h-[20rem] xl:w-[15rem]",
          current ? "scale-100 opacity-100" : "scale-75 opacity-0",
        )}
      >
        {items.map((item) =>
          item.image ? (
            <Image
              key={item.id}
              src={item.image.src}
              alt=""
              fill
              sizes="240px"
              className={cn(
                "object-cover transition-opacity duration-500",
                current?.id === item.id ? "opacity-100" : "opacity-0",
              )}
            />
          ) : null,
        )}
      </div>
    </div>
  );
}
