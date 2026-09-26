import { Button } from "./Button";
import { Heading } from "./Heading";
import { RichText } from "./RichText";
import { Container } from "./Container";
import { Section } from "./Section";
import type { Link as LinkContent } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface CtaBandProps {
  heading?: string;
  body?: string;
  ctas: LinkContent[];
  headingId?: string;
}

/**
 * Left-aligned on asphalt with a brand rule down the left edge. Centred
 * white text on a coloured band is the most generic module on the web, and the
 * rest of the site is left-aligned — this matches it.
 */
export function CtaBand({ heading, body, ctas, headingId }: CtaBandProps) {
  return (
    <Section tone="asphalt" labelledBy={heading ? headingId : undefined}>
      <Container>
        <div className="border-l-[3px] border-brand pl-6 md:pl-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="max-w-(--container-measure)">
              {heading ? (
                <Heading
                  level={2}
                  text={heading}
                  id={headingId}
                  className="text-concrete"
                />
              ) : null}
              {body ? (
                <p
                  className={cn(
                    "text-lg text-concrete wdth-body",
                    heading && "mt-4",
                  )}
                >
                  <RichText text={body} />
                </p>
              ) : null}
            </div>

            {ctas.length ? (
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                {ctas.map((cta, index) => (
                  <Button
                    key={cta.href}
                    label={cta.label}
                    href={cta.href}
                    variant={index === 0 ? "primary" : "inverse"}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
