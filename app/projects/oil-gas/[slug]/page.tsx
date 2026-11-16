import type { Metadata } from "next";

import { UseCasePage, buildUseCaseMetadata, getUseCaseParams } from "@/components/UseCaseLayout";

/**
 * One Oil & Gas use case, from `content/use-cases.json`.
 *
 * Nested under the static `oil-gas` category folder, so it does not collide
 * with `/projects/[slug]`. Another service's use cases would be one more
 * four-line folder like this one, with its own service slug.
 */
const serviceSlug = "oil-gas";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getUseCaseParams(serviceSlug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return buildUseCaseMetadata(serviceSlug, slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <UseCasePage serviceSlug={serviceSlug} slug={slug} />;
}
