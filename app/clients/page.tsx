import type { Metadata } from "next";
import { ClientList } from "@/components/ClientList";
import { Container } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { Heading } from "@/components/Heading";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { getClients, getPage, getSection, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

const page = getPage("clients");
const site = getSite();

const intro = getSection(page, "intro", "prose");
const all = getSection(page, "all-clients", "collection");
const cta = getSection(page, "cta-default", "cta");

const clients = getClients();

/** Only categories that have clients, so a group never renders empty. */
const groups = (all.facets ?? []).filter((facet) =>
  clients.some((client) => client.category === facet.value),
);

export const metadata: Metadata = buildPageMetadata(page, site);

export default function ClientsPage() {
  return (
    <>
      <Section tone="concrete" labelledBy="clients-heading">
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-4">
              <Heading level={1} text={page.title} id="clients-heading" />
            </div>

            <div className="mt-5 flex flex-col gap-5 lg:col-span-7 lg:col-start-6 lg:mt-0">
              {intro.body.map((paragraph, index) => (
                <p
                  key={index}
                  className="max-w-(--container-measure) text-lg text-asphalt wdth-body text-pretty"
                >
                  <RichText text={paragraph} />
                </p>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="white" labelledBy="clients-register">
        <Container>
          {all.heading ? (
            <Heading level={2} text={all.heading} id="clients-register" />
          ) : null}

          <ClientList clients={clients} groups={groups} className="mt-10 md:mt-12" />

          {all.note ? (
            <p className="mt-10 max-w-(--container-measure) text-xs text-steel-ink wdth-body">
              <RichText text={all.note} />
            </p>
          ) : null}
        </Container>
      </Section>

      <CtaBand
        heading={cta.heading}
        body={cta.body}
        ctas={cta.ctas}
        headingId="clients-cta"
      />
    </>
  );
}
