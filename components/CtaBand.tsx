import { Button } from "./Button";
import { Heading } from "./Heading";
import { RichText } from "./RichText";
import { Container } from "./Container";
import { Section } from "./Section";
import type { Link as LinkContent } from "@/lib/content-types";

export interface CtaBandProps {
  heading?: string;
  body?: string;
  ctas: LinkContent[];
  headingId?: string;
}

/** The closing band: ink, the question large and centred, two ways on. */
export function CtaBand({ heading, body, ctas, headingId }: CtaBandProps) {
  return (
    <Section tone="asphalt" labelledBy={heading ? headingId : undefined}>
      <Container className="flex flex-col items-center text-center">
        {heading ? (
          <Heading level={2} text={heading} id={headingId} split className="max-w-[20ch] text-concrete" />
        ) : null}
        {body ? (
          <p data-anim="fade" data-delay={200} className="mt-6 max-w-[52ch] text-lg text-steel-light text-pretty">
            <RichText text={body} />
          </p>
        ) : null}
        {ctas.length ? (
          <div data-anim="fade" data-delay={320} className="mt-10 flex flex-col gap-3 sm:flex-row">
            {ctas.map((cta, index) => (
              <Button
                key={cta.href}
                label={cta.label}
                href={cta.href}
                variant={index === 0 ? "light" : "inverse"}
              />
            ))}
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
