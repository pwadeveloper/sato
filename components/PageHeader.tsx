import { ViewTransition, type CSSProperties, type ReactNode } from "react";
import { Container } from "./Container";
import { DevelopImage } from "./DevelopImage";
import { Eyebrow } from "./Eyebrow";
import { Heading } from "./Heading";
import { RichText } from "./RichText";
import { ScaleRule } from "./ScaleRule";
import { Section } from "./Section";
import type { ImageRef } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface PageHeaderProps {
  title: string;
  /** The page's lead paragraphs, on the measure under the heading. */
  intro?: string[];
  /** A small mono line above the title — the section the page sits in. */
  eyebrow?: string;
  image?: ImageRef | null;
  /**
   * Pairs the photograph with the tile it was opened from, so the picture
   * morphs into the header rather than being replaced — `category-<slug>`
   * on a project category page.
   */
  transitionName?: string;
  /** Breadcrumbs, a draft notice — anything that belongs above the heading. */
  above?: ReactNode;
  /** A sub-nav or similar, directly under the photograph. */
  below?: ReactNode;
  headingId?: string;
  className?: string;
}

/**
 * Heading on the page background, photograph beneath it.
 *
 * Every page opens this way. The client's word for the old site was
 * "academic" — pages that began with a column of text and reached a picture
 * three screens down, if at all. Putting the photograph in the header costs
 * nothing a reader wants and changes what the page is before they read a
 * word of it.
 *
 * The picture sits below the heading rather than behind it. Text over a
 * photograph has to be fought for at every breakpoint, and on a header
 * repeated across fifteen pages that fight is lost somewhere. The one page
 * that does set its heading over the image — Oil & Gas — uses artwork drawn
 * with an empty area for exactly that.
 *
 * What moves: the title rises a word at a time, the lead follows it, and the
 * photograph develops from a field of dots as the page paints — the drawing
 * becoming the work. The scale bar along the picture's top edge is the
 * drawing's, in the page colour.
 */
export function PageHeader({
  title,
  intro = [],
  eyebrow,
  image,
  transitionName,
  above,
  below,
  headingId,
  className,
}: PageHeaderProps) {
  const picture = image ? (
    <DevelopImage
      image={image}
      sizes="100vw"
      priority
      develop="load"
      className="aspect-3/2 w-full sm:aspect-16/7 lg:aspect-16/6"
    />
  ) : null;

  return (
    <div className={cn(className)}>
      <Section tone="concrete" as="div" className="dot-grid pb-10 md:pb-12">
        <Container>
          {above}
          {eyebrow ? (
            <Eyebrow text={eyebrow} className={cn(above ? "mt-8" : undefined)} />
          ) : null}
          <Heading
            level={1}
            text={title}
            id={headingId}
            split
            className={cn(eyebrow ? "mt-4" : above ? "mt-6" : undefined, "max-w-[18ch]")}
          />

          {intro.map((paragraph, index) => (
            <p
              key={index}
              data-fade=""
              style={{ "--fade-delay": `${320 + index * 90}ms` } as CSSProperties}
              className="mt-6 max-w-(--container-measure) text-lg text-steel-ink wdth-body text-pretty"
            >
              <RichText text={paragraph} />
            </p>
          ))}
        </Container>
      </Section>

      {image ? (
        <div className="relative">
          <ScaleRule className="absolute inset-x-0 top-0 z-10 text-concrete/80" />
          {transitionName ? (
            <ViewTransition name={transitionName}>{picture}</ViewTransition>
          ) : (
            picture
          )}
        </div>
      ) : null}

      {below}
    </div>
  );
}
