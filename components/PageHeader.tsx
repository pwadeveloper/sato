import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "./Container";
import { Heading } from "./Heading";
import { RichText } from "./RichText";
import { Section } from "./Section";
import type { ImageRef } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface PageHeaderProps {
  title: string;
  /** The page's lead paragraphs, on the measure under the heading. */
  intro?: string[];
  image?: ImageRef | null;
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
 * Every page opens this way now. The client's word for the old site was
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
 */
export function PageHeader({
  title,
  intro = [],
  image,
  above,
  below,
  headingId,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn(className)}>
      <Section tone="concrete" as="div" className="pb-10 md:pb-12">
        <Container>
          {above}
          <Heading
            level={1}
            text={title}
            id={headingId}
            className={above ? "mt-6" : undefined}
          />

          {intro.map((paragraph, index) => (
            <p
              key={index}
              className="mt-5 max-w-(--container-measure) text-lg text-steel-ink wdth-body text-pretty"
            >
              <RichText text={paragraph} />
            </p>
          ))}
        </Container>
      </Section>

      {image ? (
        <div className="relative aspect-3/2 w-full bg-steel/10 sm:aspect-16/7 lg:aspect-16/6">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>
      ) : null}

      {below}
    </div>
  );
}
