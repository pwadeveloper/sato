import { ViewTransition, type ReactNode } from "react";
import { Container } from "./Container";
import { DevelopImage } from "./DevelopImage";
import { Eyebrow } from "./Eyebrow";
import { Heading } from "./Heading";
import { RichText } from "./RichText";
import type { ImageRef } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface PageHeaderProps {
  title: string;
  /** The page's lead paragraphs, beside the title on a desktop. */
  intro?: string[];
  /** A small label above the title. */
  eyebrow?: string;
  image?: ImageRef | null;
  /**
   * Pairs the photograph with the tile it was opened from, so the picture
   * morphs into the header rather than being replaced.
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
 * Every page opens the same way: the title large on the page, its lead set
 * beside it, and a wide photograph beneath that wipes open and drifts.
 *
 * The picture sits below the heading rather than behind it — text over a
 * photograph has to be won at every breakpoint, and on a header repeated
 * across fifteen pages that fight is lost somewhere. Oil & Gas is the one
 * page that sets its heading over its artwork.
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
  // A short lead sits on the title's baseline; a long one hangs from its top.
  const shortIntro = intro.join(" ").length < 180;
  const picture = image ? (
    <DevelopImage
      image={image}
      sizes="100vw"
      priority
      develop="load"
      parallax
      className="aspect-4/3 w-full sm:aspect-16/8 lg:aspect-21/9"
    />
  ) : null;

  return (
    <div className={cn("bg-concrete", className)}>
      <Container className="pb-10 pt-12 md:pb-14 md:pt-16 lg:pt-20">
        {above}
        {eyebrow ? <Eyebrow text={eyebrow} className={above ? "mt-10" : undefined} /> : null}

        <div
          className={cn(
            "lg:grid lg:grid-cols-12 lg:gap-x-12",
            shortIntro ? "lg:items-end" : "lg:items-start",
            above || eyebrow ? "mt-8 md:mt-10" : undefined,
          )}
        >
          <Heading
            level={1}
            text={title}
            id={headingId}
            split
            className={cn("max-w-[16ch]", intro.length ? "lg:col-span-7" : "lg:col-span-10")}
          />

          {intro.length ? (
            <div data-anim="fade" data-delay={300} className={cn("mt-8 flex flex-col gap-4 lg:col-span-5 lg:mt-0", shortIntro ? "lg:pb-3" : "lg:pt-4")}>
              {intro.map((paragraph, index) => (
                <p key={index} className="max-w-(--container-measure) text-lg text-steel-ink text-pretty">
                  <RichText text={paragraph} />
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </Container>

      {picture ? (
        <div className="px-(--gutter)">
          {transitionName ? <ViewTransition name={transitionName}>{picture}</ViewTransition> : picture}
        </div>
      ) : null}

      {below}
    </div>
  );
}
