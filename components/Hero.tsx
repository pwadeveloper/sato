import Image from "next/image";
import { Button } from "./Button";
import { Container } from "./Container";
import { RichText } from "./RichText";
import { TextLink } from "./TextLink";
import type { ImageRef, Link as LinkContent } from "@/lib/content-types";

export interface HeroProps {
  /** The page's `h1`. */
  headline: string;
  subhead?: string;
  /** First is the primary button; the second reads as a text link beside it. */
  ctas?: LinkContent[];
  image?: ImageRef;
}

/**
 * Home hero.
 *
 * Text sits on the page measure; the photograph bleeds off the right edge on
 * large screens and drops below the copy, still full-bleed, at narrow widths.
 * Nothing is centred and nothing animates in — the headline is readable in the
 * first frame.
 */
export function Hero({ headline, subhead, ctas = [], image }: HeroProps) {
  const [primary, ...rest] = ctas;

  return (
    <section aria-labelledby="hero-heading" className="relative border-b border-rule">
      <Container className="relative z-10 py-12 md:py-16 lg:py-24">
        <div className="lg:max-w-[52%]">
          <h1
            id="hero-heading"
            className="text-display wdth-display text-balance text-asphalt"
          >
            <RichText text={headline} />
          </h1>

          {subhead ? (
            <p className="mt-6 max-w-(--container-measure) text-lg text-steel-ink wdth-body md:mt-8">
              <RichText text={subhead} />
            </p>
          ) : null}

          {ctas.length ? (
            <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8 md:mt-10">
              {primary ? (
                <Button
                  label={primary.label}
                  href={primary.href}
                  className="w-full sm:w-auto"
                />
              ) : null}
              {rest.map((cta) => (
                <TextLink key={cta.href} label={cta.label} href={cta.href} />
              ))}
            </div>
          ) : null}
        </div>
      </Container>

      {image ? (
        <div
          className="
            relative aspect-16/9 w-full overflow-hidden bg-steel/10
            sm:aspect-21/9
            lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[42%]
          "
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
    </section>
  );
}
