import type { Metadata } from "next";
import { ClientList } from "@/components/ClientList";
import { Container } from "@/components/Container";
import { DraftNotice } from "@/components/DraftNotice";
import { PageHeader } from "@/components/PageHeader";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/Section";
import { getClients, getPage, getSection, getService, getSite } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { isReviewMode } from "@/lib/review-mode";

const page = getPage("clients");
const site = getSite();

const intro = getSection(page, "intro", "prose");
const own = getSection(page, "all-clients", "collection");
const partner = getSection(page, "oil-gas-clients", "collection");

const clients = getClients();
const satoClients = clients.filter((client) => client.category !== "oil-gas-partner");
const partnerClients = clients.filter((client) => client.category === "oil-gas-partner");

/**
 * The partner list is gated with the Oil & Gas page it belongs to: the same
 * `reviewStatus` blocks the production build while either is unapproved, so
 * the two can never go live apart from each other.
 */
const partnerIsDraft = getService("oil-gas").reviewStatus === "draft";

export const metadata: Metadata = buildPageMetadata(page, site);

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title={page.title}
        intro={intro.body}
        image={page.images?.header}
        headingId="clients-heading"
      />

      <Section tone="concrete">
        <Container>
          {own.heading ? (
            <h2 className="text-h3 wdth-heading text-balance">
              <RichText text={own.heading} />
            </h2>
          ) : null}

          <ClientList clients={satoClients} className={own.heading ? "mt-6" : undefined} />

          {own.note ? (
            <p className="mt-8 max-w-(--container-measure) text-xs text-steel-ink wdth-body">
              <RichText text={own.note} />
            </p>
          ) : null}
        </Container>
      </Section>

      {/*
        Kept apart, under its own attributed heading. These organisations
        were served by the partner team, not by Sato, and the heading is the
        first thing read — a reader who skims the page must not be able to
        come away thinking Sato holds a contract with Saudi Aramco.
      */}
      {partnerClients.length ? (
        <Section tone="white" labelledBy="oil-gas-clients-heading">
          <Container>
            {isReviewMode && partnerIsDraft ? <DraftNotice className="mb-8" /> : null}

            <h2
              id="oil-gas-clients-heading"
              className="border-t-[3px] border-brand pt-6 text-h3 wdth-heading text-balance"
            >
              <RichText text={partner.heading ?? ""} />
            </h2>

            {partner.intro ? (
              <p className="mt-4 max-w-(--container-measure) text-base text-steel-ink wdth-body text-pretty">
                <RichText text={partner.intro} />
              </p>
            ) : null}

            <ClientList clients={partnerClients} className="mt-8" />
          </Container>
        </Section>
      ) : null}
    </>
  );
}
