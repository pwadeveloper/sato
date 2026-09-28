import type { Metadata } from "next";

import { ContactForm } from "@/components/ContactForm";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { PageHeader } from "@/components/PageHeader";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";

import { getPage, getSection, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { hasPlaceholder } from "@/lib/placeholders";
import { cn } from "@/lib/cn";

const page = getPage("contact");
const site = getSite();

export const metadata: Metadata = buildPageMetadata(page, site);

/**
 * Contact: the one page that opens without a photograph.
 *
 * Every other route leads with a picture. This one led with a 602px shot of
 * the office frontage, which was the weakest image on the site and told a
 * visitor nothing they came for. What they came for is the telephone number,
 * so that is what carries the top of the page instead — set large on a dark
 * band, in the slot the photograph used to fill.
 *
 * The channels are lifted out of the office list for the same reason. That
 * list was headed "Offices" and then held a phone number and an email
 * address underneath the two addresses; now the heading is true, and the
 * details a procurement officer is looking for are the first thing under the
 * lead rather than the fifth row of a list.
 */
export default function ContactPage() {
  const labels = page.labels ?? {};
  const intro = getSection(page, "intro", "prose");
  const channels = getSection(page, "channels", "prose");
  const offices = getSection(page, "offices", "offices");
  const form = getSection(page, "enquiry-form", "form");

  // The fallback needs a real address to compose a mailto:; while the enquiries
  // address is still unconfirmed there is nothing to send to.
  const firstEmail = site.emails[0];
  const fallbackEmail =
    firstEmail && !hasPlaceholder(firstEmail.value) ? firstEmail.value : "";

  return (
    <>
      <PageHeader
        title={page.title}
        intro={intro.body}
        headingId="contact-heading"
      />

      {/*
        The brand rule down the left edge is the CTA band's, reused: it is how
        a dark band is marked as deliberate on this site rather than as a gap
        where an image failed to load.
      */}
      <Section tone="asphalt" labelledBy="channels">
        <Container>
          <div className="border-l-[3px] border-brand pl-6 md:pl-10">
            <h2
              id="channels"
              className="text-2xs font-semibold uppercase tracking-[0.08em] text-brand-light wdth-body"
            >
              <RichText text={channels.heading ?? ""} />
            </h2>

            <dl className="mt-6 grid gap-8 sm:grid-cols-2 sm:gap-12">
              {[
                ...site.phones.map((channel) => ({ channel, kind: "phone" as const })),
                ...site.emails.map((channel) => ({ channel, kind: "email" as const })),
              ].map(({ channel, kind }) => {
                const isPlaceholder = hasPlaceholder(channel.value);
                const href =
                  channel.href ??
                  (isPlaceholder ? undefined : `mailto:${channel.value}`);

                const value = (
                  <span
                    className={cn(
                      // Body width, not the expanded heading width: these are
                      // data, not headings, and at 360px the email set in the
                      // expanded axis overflows and breaks after "…co".
                      "text-h3 wdth-body",
                      // A telephone number is a figure: tabular so the digit
                      // groups line up, and unbroken so it is never split
                      // mid-group. An address has no spaces to wrap at, so it
                      // may break when it has to rather than push the band
                      // wide.
                      kind === "phone"
                        ? "tabular whitespace-nowrap"
                        : "break-words",
                    )}
                  >
                    <RichText text={channel.value} />
                  </span>
                );

                return (
                  <div key={channel.id}>
                    <dt className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-light wdth-body">
                      <RichText text={channel.label} />
                    </dt>

                    <dd className="mt-2">
                      {href && !isPlaceholder ? (
                        <a
                          href={href}
                          // Underlined at rest: colour alone is not an
                          // affordance, and on this band the value would
                          // otherwise be the same concrete as the text around
                          // it. The pseudo-element lifts a ~30px line of text
                          // to a 46px target without moving anything.
                          className="relative inline-block text-concrete underline decoration-1 decoration-brand-light/40 underline-offset-[0.2em] transition-colors duration-150 hover:text-brand-light hover:decoration-brand-light before:absolute before:inset-x-0 before:-inset-y-2 before:content-['']"
                        >
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>

                    {channel.note ? (
                      <p className="mt-2 text-sm text-steel-light wdth-body">
                        <RichText text={channel.note} />
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </dl>
          </div>
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
                          className="relative inline-block py-1 text-sm font-medium text-brand-ink underline underline-offset-[0.2em] decoration-1 transition-colors duration-150 hover:text-brand-deep before:absolute before:-inset-2 before:content-['']"
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
