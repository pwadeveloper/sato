import type { Metadata } from "next";
import {
  ProjectCategoryPage,
  buildCategoryMetadata,
} from "@/components/ProjectCategoryPage";

/**
 * A static segment, so it wins over `/projects/[slug]` — no project uses
 * this slug. See `components/ProjectCategoryPage.tsx` for why the three
 * categories are three files.
 */
const slug = "civil-engineering-roads";

export const metadata: Metadata = buildCategoryMetadata(slug);

export default function Page() {
  return <ProjectCategoryPage slug={slug} />;
}
