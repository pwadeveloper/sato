import Link from "next/link";
import { RichText } from "./RichText";
import type { Link as LinkContent } from "@/lib/content-types";

export interface BreadcrumbsProps {
  /** Ancestors in order. The current page is passed separately. */
  trail: LinkContent[];
  current: string;
  label: string;
}

export function Breadcrumbs({ trail, current, label }: BreadcrumbsProps) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-steel-ink wdth-body">
        {trail.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-x-2">
            <Link
              href={crumb.href}
              className="underline underline-offset-[0.2em] decoration-1 decoration-steel hover:text-green-ink"
            >
              <RichText text={crumb.label} />
            </Link>
            <span aria-hidden="true" className="text-steel">
              /
            </span>
          </li>
        ))}
        <li aria-current="page" className="text-asphalt">
          <RichText text={current} />
        </li>
      </ol>
    </nav>
  );
}
