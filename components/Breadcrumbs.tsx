import Link from "next/link";
import { RichText } from "./RichText";
import type { Link as LinkContent } from "@/lib/content-types";

export interface BreadcrumbsProps {
  /** Ancestors in order. The current page is passed separately. */
  trail: LinkContent[];
  current: string;
  label: string;
}

/** The trail, in the mono: a drawing's reference line. */
export function Breadcrumbs({ trail, current, label }: BreadcrumbsProps) {
  return (
    <nav aria-label={label}>
      <ol className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-steel-ink">
        {trail.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-x-3">
            <Link
              href={crumb.href}
              className="link-draw transition-colors duration-150 hover:text-brand-ink"
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
