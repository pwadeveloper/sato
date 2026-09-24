import { Button } from "./Button";
import { Container } from "./Container";
import { HeroCarousel } from "./HeroCarousel";
import { RichText } from "./RichText";
import { TextLink } from "./TextLink";
import type { ImageRef, Link as LinkContent } from "@/lib/content-types";

export interface HeroProps {
  /** The page's `h1`. */
  headline: string;
  subhead?: string;
  /** First reads as the bordered button; any others follow as text links. */
  ctas?: LinkContent[];
  /** Crossfaded full-bleed background. */
  backgroundImages?: ImageRef[];
}

/**
 * Home hero — a full-bleed photograph with the copy set over it.
 *
 * Legibility is handled twice over, because a single measure would have to be
 * tuned to the brightest frame in the set and would flatten the rest: the
 * photographs are darkened at build time (`exposure` in image-map.json), and
 * a scrim sits over them here, weighted to the bottom where the copy sits.
 * Together they hold white text above 4.5:1 on every frame.
 *
 * `data-hero="bleed"` tells the sticky header to sit transparently over this
 * section and take a solid background once it is scrolled past. The section
 * is pulled up by the header's height so the picture runs to the very top of
 * the window and the nav reads as part of it.
 */
export function Hero({ headline, subhead, ctas = [], backgroundImages = [] }: HeroProps) {
  const [primary, ...rest] = ctas;

  return (
    <section
      aria-labelledby="hero-heading"
      data-hero="bleed"
      className="
        relative isolate flex min-h-svh flex-col justify-end overflow-hidden
        bg-asphalt text-concrete
        -mt-[var(--header-height)]
      "
    >
      {backgroundImages.length ? <HeroCarousel images={backgroundImages} /> : null}

      {/* Scrim. Heavier at the foot, where the headline and paragraph sit. */}
      <div
        aria-hidden="true"
        className="
          absolute inset-0
          bg-asphalt/25
          [background-image:linear-gradient(to_top,var(--color-asphalt)_0%,color-mix(in_srgb,var(--color-asphalt)_70%,transparent)_28%,color-mix(in_srgb,var(--color-asphalt)_18%,transparent)_62%,color-mix(in_srgb,var(--color-asphalt)_48%,transparent)_100%)]
        "
      />

      <Container
        width="bleed"
        className="relative z-10 pb-12 pt-[calc(var(--header-height)+6rem)] md:pb-16 lg:pb-20"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <h1
            id="hero-heading"
            className="text-display wdth-display max-w-[18ch] text-balance"
          >
            <RichText text={headline} />
          </h1>

          {subhead || ctas.length ? (
            <div className="flex flex-col items-start gap-5 lg:max-w-[38ch] lg:shrink-0 lg:pb-2">
              {subhead ? (
                <p className="text-sm text-concrete/90 wdth-body text-pretty">
                  <RichText text={subhead} />
                </p>
              ) : null}

              {ctas.length ? (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {primary ? (
                    <Button
                      label={primary.label}
                      href={primary.href}
                      variant="inverse"
                      size="compact"
                    />
                  ) : null}
                  {rest.map((cta) => (
                    <TextLink
                      key={cta.href}
                      label={cta.label}
                      href={cta.href}
                      tone="dark"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
