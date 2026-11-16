import Link from "next/link";
import { RichText } from "./RichText";
import type { ResultItem } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface UseCaseCardProps {
  href: string;
  /** "Use case", from the page's labels. */
  eyebrow: string;
  title: string;
  clientDisplay: string;
  results: ResultItem[];
  linkLabel: string;
  className?: string;
}

/**
 * A use case, as a single link: the title, the client as it may be named,
 * and its headline results. Used on `/projects/oil-gas` and on Home.
 *
 * The whole card is the link (the title's anchor stretches over it), so the
 * results inside are text, not separate destinations.
 */
export function UseCaseCard({
  href,
  eyebrow,
  title,
  clientDisplay,
  results,
  linkLabel,
  className,
}: UseCaseCardProps) {
  return (
    <article
      className={cn(
        "group relative grid gap-8 border-t-[3px] border-brand bg-asphalt p-6 text-concrete md:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14",
        className,
      )}
    >
      <div>
        <p className="eyebrow text-xs! text-brand-light">
          <RichText text={eyebrow} />
          <span aria-hidden="true"> · </span>
          <RichText text={clientDisplay} />
        </p>
        <h3 className="mt-4 font-bold wdth-heading text-[clamp(2rem,1.5rem+2vw,3.25rem)] leading-[1.02] tracking-[-0.02em] text-balance">
          <Link href={href} className="text-concrete no-underline after:absolute after:inset-0 after:content-['']">
            <RichText text={title} />
          </Link>
        </h3>
        <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-light wdth-body">
          <RichText text={linkLabel} />
          <span
            aria-hidden="true"
            className="transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-1 motion-reduce:transition-none"
          >
            &rarr;
          </span>
        </p>
      </div>

      {results.length ? (
        <ul className="grid gap-px self-end border border-rule-dark bg-rule-dark sm:grid-cols-2">
          {results.map((result) => (
            <li key={result.id} className="bg-asphalt p-5">
              {result.value ? (
                <p aria-hidden="true" className="font-bold wdth-heading text-3xl leading-none tracking-[-0.02em] text-brand-light tabular xl:text-4xl">
                  <RichText text={result.value} />
                </p>
              ) : null}
              <p className="mt-3 text-sm leading-snug text-steel-light wdth-body text-pretty">
                <RichText text={result.label} />
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
