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
  /** First reads as the bordered button; any others follow as text links. */
  ctas?: LinkContent[];
  image?: ImageRef;
}

/**
 * Home hero.
 *
 * A single dark field running from under the header down to a wide band of
 * photography. The headline sits at the bottom left with the supporting
 * paragraph set small at the right, their baselines close together, so the
 * eye reads the claim first and the qualification second.
 *
 * `data-hero="dark"` tells the sticky header to switch to its dark tone, so
 * the nav reads as part of this field rather than a bar sitting on top of it.
 */
export function Hero({ headline, subhead, ctas = [], image }: HeroProps) {
  const [primary, ...rest] = ctas;

  return (
    <section
      aria-labelledby="hero-heading"
      data-hero="dark"
      className="bg-asphalt text-concrete"
    >
      <Container>
        <div
          className="
            flex flex-col gap-8
            pt-14 pb-10
            md:pt-24
            lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pt-44 lg:pb-14
          "
        >
          <h1
            id="hero-heading"
            className="text-display wdth-display max-w-[18ch] text-balance"
          >
            <RichText text={headline} />
          </h1>

          {subhead || ctas.length ? (
            <div className="flex flex-col items-start gap-5 lg:max-w-[38ch] lg:shrink-0 lg:pb-2">
              {subhead ? (
                <p className="text-sm text-steel-light wdth-body text-pretty">
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

      {image ? (
        <Container>
          <div
            className="
              relative w-full overflow-hidden bg-asphalt-raised
              aspect-4/3 sm:aspect-16/9 lg:aspect-[64/21]
            "
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 1280px) 1184px, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      ) : null}

      {/* The dark field ends flush with the foot of the photograph. */}
      <div aria-hidden="true" className="h-0" />
    </section>
  );
}
