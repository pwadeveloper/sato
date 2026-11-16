import Image from "next/image";
import Link from "next/link";

import { RichText } from "../RichText";
import type { ImageRef } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface PillarLink {
  label: string;
  href: string;
  /** Sections of the linked page, listed beneath it — Oil & Gas's pillars. */
  children?: PillarLink[];
}

export interface Pillar {
  id: string;
  label: string;
  intro?: string;
  href: string;
  image?: ImageRef;
  links: PillarLink[];
}

/**
 * The two halves of the company, side by side and at the same weight:
 * Infrastructure with its four disciplines, Energy with Oil & Gas (and its
 * three capability pillars, each linked to its place on the service page)
 * and the other energy services.
 *
 * Built from the service categories, so a service renamed or added in
 * `services.json` is renamed or added here.
 */
export function HomePillars({ pillars, className }: { pillars: Pillar[]; className?: string }) {
  return (
    <div className={cn("grid gap-6 lg:grid-cols-2", className)}>
      {pillars.map((pillar, index) => (
        <article
          key={pillar.id}
          aria-labelledby={`pillar-${pillar.id}`}
          className="flex flex-col border border-rule bg-paper"
          data-anim="fade"
          data-delay={index * 120}
        >
          {pillar.image ? (
            <div className="relative aspect-16/9 overflow-hidden">
              <Image
                src={pillar.image.src}
                alt={pillar.image.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                style={pillar.image.focalPoint ? { objectPosition: pillar.image.focalPoint } : undefined}
              />
            </div>
          ) : null}

          <div className="flex flex-1 flex-col p-6 md:p-8">
            <p aria-hidden="true" className="eyebrow tabular text-xs! text-steel-ink">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 id={`pillar-${pillar.id}`} className="mt-2 font-display text-[clamp(2.25rem,1.6rem+2vw,3.5rem)] leading-none tracking-[-0.02em]">
              <Link href={pillar.href} className="link-draw text-asphalt no-underline hover:text-brand-ink">
                <RichText text={pillar.label} />
              </Link>
            </h3>
            {pillar.intro ? (
              <p className="mt-4 max-w-[44ch] text-base text-steel-ink text-pretty">
                <RichText text={pillar.intro} />
              </p>
            ) : null}

            <ul className="mt-6 border-t border-asphalt">
              {pillar.links.map((link) => (
                <li key={link.href} className="border-b border-rule">
                  <Link
                    href={link.href}
                    className="group flex items-baseline justify-between gap-4 py-3 text-base font-medium text-asphalt no-underline wdth-body hover:text-brand-ink"
                  >
                    <RichText text={link.label} />
                    <span aria-hidden="true" className="text-steel transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-1 group-hover:text-brand motion-reduce:transition-none">
                      &rarr;
                    </span>
                  </Link>
                  {link.children?.length ? (
                    <ul className="mb-3 ml-1 border-l-2 border-brand/50 pl-4">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block py-1.5 text-sm text-steel-ink no-underline wdth-body hover:text-brand-ink"
                          >
                            <RichText text={child.label} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}
