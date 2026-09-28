import type { Metadata } from "next";
import {
  ProjectCategoryPage,
  buildCategoryMetadata,
} from "@/components/ProjectCategoryPage";

/**
 * A static segment, so it wins over `/projects/[slug]` — no project uses
 * this slug. See `components/ProjectCategoryPage.tsx` for why the categories
 * are separate files, and why this one renders a table rather than cards.
 */
const slug = "oil-gas";

export const metadata: Metadata = buildCategoryMetadata(slug);

export default function Page() {
  return <ProjectCategoryPage slug={slug} />;
}
