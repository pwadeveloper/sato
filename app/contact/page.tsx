import type { Metadata } from "next";

import { ContactForm } from "@/components/ContactForm";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";

import { getPage, getSection, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { hasPlaceholder } from "@/lib/placeholders";

const page = getPage("contact");
const site = getSite();

export const metadata: Metadata = buildPageMetadata(page, site);

export default function ContactPage() {
  const labels = page.labels ?? {};
  const intro = getSection(page, "intro", "prose");
  const offices = getSection(page, "offices", "offices");
  const form = getSection(page, "enquiry-form", "form");

  // The fallback needs a real address to compose a mailto:; while the enquiries
  // address is still unconfirmed there is nothing to send to.
  const firstEmail = site.emails[0];
  const fallbackEmail =
    firstEmail && !hasPlaceholder(firstEmail.value) ? firstEmail.value : "";

  return (
    <>
      <Section tone="concrete">
        <Container>
          <Heading level={1} text={page.title} />
          {intro.body.map((paragraph, index) => (
            <p
              key={index}
              className="mt-5 max-w-(--container-measure) text-lg text-steel-ink wdth-body"
            >
              <RichText text={paragraph} />
            </p>
          ))}
        </Container>
      </Section>

      <Section tone="white" labelledBy="offices">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <Heading level={2} text={offices.heading ?? ""} id="offices" size="h3" />

              <ul className="mt-6 border-t border-asphalt">
                {site.offices.map((office) => (
                  <li key={office.id} className="border-b border-rule py-6">
                    <h3 className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body">
                      <RichText text={office.label} />
                    </h3>

                    <address className="mt-2 not-italic">
                      <p className="text-base wdth-body">
                        <RichText text={office.address} />
                      </p>

                      {office.note ? (
                        <p className="mt-1 text-sm text-steel-ink wdth-body">
                          <RichText text={office.note} />
                        </p>
                      ) : null}
                    </address>

                    {office.mapUrl ? (
                      <p className="mt-3">
                        <a
                          href={office.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-brand-ink underline underline-offset-[0.2em] decoration-1 hover:text-brand-deep"
                        >
                          <RichText text={labels.mapLink ?? ""} />
                          <span className="sr-only">
                            {" — "}
                            <RichText text={office.label} />
                          </span>
                        </a>
                      </p>
                    ) : null}
                  </li>
                ))}

                {[...site.phones, ...site.emails].map((channel) => {
                  const isPlaceholder = hasPlaceholder(channel.value);
                  const href =
                    channel.href ??
                    (isPlaceholder ? undefined : `mailto:${channel.value}`);

                  return (
                    <li key={channel.id} className="border-b border-rule py-6">
                      <h3 className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body">
                        <RichText text={channel.label} />
                      </h3>

                      <p className="mt-2 text-base tabular wdth-body">
                        {href && !isPlaceholder ? (
                          <a
                            href={href}
                            className="text-brand-ink underline underline-offset-[0.2em] decoration-1 hover:text-brand-deep"
                          >
                            <RichText text={channel.value} />
                          </a>
                        ) : (
                          <RichText text={channel.value} />
                        )}
                      </p>

                      {channel.note ? (
                        <p className="mt-1 text-sm text-steel-ink wdth-body">
                          <RichText text={channel.note} />
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <Heading level={2} text={form.heading ?? ""} id="enquiry-form" size="h3" />

              <div className="mt-6">
                <ContactForm
                  form={form}
                  endpoint={site.contactFormEndpoint}
                  fallbackEmail={fallbackEmail}
                  optionalLabel={labels.optional ?? ""}
                  headingId="enquiry-form"
                />
              </div>

              {form.note ? (
                <p className="mt-6 text-sm text-steel-ink wdth-body">
                  <RichText text={form.note} />
                </p>
              ) : null}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
