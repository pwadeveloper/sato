"use client";

import Link from "next/link";
import { ViewTransition, useEffect, useLayoutEffect, useRef } from "react";
import { DevelopImage } from "../DevelopImage";
import { RichText } from "../RichText";
import type { CollectionFacet } from "@/lib/content-types";
import { getGsap, motionEnabled } from "@/lib/gsap";
import { cn } from "@/lib/cn";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface ProjectsRailItem {
  category: CollectionFacet;
  count: number;
}

export interface ProjectsRailProps {
  items: ProjectsRailItem[];
  countOne: string;
  countMany: string;
  label: string;
  /** The last card: a way on to every project. */
  allLabel: string;
  allHref: string;
  className?: string;
}

/**
 * One card per published project category, on a rail.
 *
 * On a desktop the section pins and vertical scroll drives the rail sideways
 * — the reader keeps scrolling and the categories pass in front of them, each
 * photograph drifting inside its frame. Below `lg`, and under reduced motion,
 * it is a native horizontal scroller with snap points. A category with no
 * projects is never here: `getProjectCategories()` does not return one.
 *
 * Each photograph is the category's spotlight and morphs into the header of
 * the category's page when the card is opened.
 */
export function ProjectsRail({ items, countOne, countMany, label, allLabel, allHref, className }: ProjectsRailProps) {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useIsoLayoutEffect(() => {
    if (!motionEnabled() || !section.current || !track.current) return;
    const { gsap } = getGsap();
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const el = track.current!;
      const distance = () => el.scrollWidth - el.parentElement!.clientWidth;
      const header = () =>
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) * 16 || 96;
      gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: () => `top top+=${header() + 40}`,
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          refreshPriority: 1,
        },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={section} className={cn("overflow-hidden", className)}>
      <ul
        ref={track}
        aria-label={label}
        className="flex snap-x snap-mandatory scroll-px-(--gutter) gap-5 overflow-x-auto px-(--gutter) pb-4 [scrollbar-width:none] lg:snap-none lg:gap-8 lg:overflow-visible lg:pb-0"
      >
        {items.map(({ category, count }, index) => {
          const countLabel = (count === 1 ? countOne : countMany).replace("{n}", String(count));
          return (
            <li key={category.value} className="group relative w-[82vw] shrink-0 snap-start sm:w-[58vw] lg:w-[34vw] xl:w-[30vw]">
              {category.image ? (
                <ViewTransition name={`category-${category.slug}`}>
                  <DevelopImage
                    image={category.image}
                    sizes="(min-width: 1024px) 34vw, 82vw"
                    parallax
                    className="aspect-4/5 w-full"
                  />
                </ViewTransition>
              ) : null}
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <span aria-hidden="true" className="eyebrow tabular text-steel">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="eyebrow text-brand-ink tabular">
                  <RichText text={countLabel} />
                </span>
              </div>
              <h3 className="mt-3 font-display text-[clamp(1.875rem,1.4rem+1.4vw,2.75rem)] font-normal leading-[1.02] tracking-[-0.02em] text-balance">
                <Link
                  href={`/projects/${category.slug}`}
                  className="text-asphalt no-underline after:absolute after:inset-0 after:content-['']"
                >
                  <RichText text={category.label} />
                </Link>
              </h3>
              {category.intro ? (
                <p className="mt-3 max-w-[40ch] text-sm text-steel-ink text-pretty">
                  <RichText text={category.intro} />
                </p>
              ) : null}
            </li>
          );
        })}

        <li className="flex w-[70vw] shrink-0 snap-start items-center sm:w-[40vw] lg:w-[24vw]">
          <Link
            href={allHref}
            className="group flex aspect-4/5 w-full flex-col items-center justify-center gap-6 rounded-(--radius-frame) border border-asphalt/15 text-asphalt no-underline transition-colors duration-500 hover:bg-asphalt hover:text-white"
          >
            <span aria-hidden="true" className="flex size-20 items-center justify-center rounded-full border border-current text-2xl transition-transform duration-700 ease-(--ease-out-expo) group-hover:rotate-[-45deg]">
              &rarr;
            </span>
            <span className="font-display text-4xl">
              <RichText text={allLabel} />
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
