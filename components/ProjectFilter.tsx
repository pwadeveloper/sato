"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ProjectCard } from "./ProjectCard";
import { RichText } from "./RichText";
import type { CollectionFacet, Project } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ProjectFilterProps {
  projects: Project[];
  /** Service categories that have projects, each with its own sub-filters. */
  facets: CollectionFacet[];
  labels: {
    filterLabel: string;
    subFilterLabel: string;
    all: string;
    countOne: string;
    /** `{n}` is replaced with the count. */
    countMany: string;
  };
  basePath?: string;
  /** Query key, so the filtered view is linkable. */
  param?: string;
}

/*
 * The query string as an external store.
 *
 * `pushState` does not fire `popstate`, so the store keeps its own listener set
 * and notifies them when we navigate. Reading through `useSyncExternalStore`
 * rather than an effect means no cascading render on mount, and the server
 * snapshot is the empty string — so the prerendered HTML is always the full,
 * unfiltered list.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("popstate", onChange);
  };
}

const getSearch = () => window.location.search;
const getServerSearch = () => "";

function pushSearch(url: string) {
  window.history.pushState(null, "", url);
  listeners.forEach((listener) => listener());
}

/** A facet's own value plus every descendant's. */
function facetValues(facet: CollectionFacet): string[] {
  return [facet.value, ...(facet.children ?? []).flatMap(facetValues)];
}

/**
 * Project filter for the project index.
 *
 * Two levels, mirroring the service structure: the top row is the service
 * category and, where that category has sub-filters, a second row narrows
 * within it. Selecting "Infrastructure Services" shows buildings, roads and
 * water together and reveals the sub-filters; selecting one of those keeps
 * the parent highlighted.
 *
 * The tabs are real links, so `?sector=water` is shareable and the page works
 * with scripting off — every project is server-rendered and the links are
 * ordinary navigations. With scripting on the same links filter in place and
 * push the URL, so the back button walks the filters.
 */
export function ProjectFilter({
  projects,
  facets,
  labels,
  basePath = "/projects",
  param = "sector",
}: ProjectFilterProps) {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);

  const requested = new URLSearchParams(search).get(param);
  const known = facets.flatMap(facetValues);
  // An unknown value falls back to showing everything.
  const active = requested && known.includes(requested) ? requested : null;

  // The category the active value sits in — the parent stays lit while one of
  // its sub-filters is selected, and its sub-filter row stays open.
  const activeParent = active
    ? facets.find((facet) => facetValues(facet).includes(active))
    : undefined;

  const href = (value: string | null) =>
    value ? `${basePath}?${param}=${value}` : basePath;

  const select = (value: string | null) => (event: React.MouseEvent) => {
    // Let modified clicks (new tab, download) behave normally.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    pushSearch(href(value));
  };

  const matching = active
    ? new Set(
        activeParent && active === activeParent.value
          ? facetValues(activeParent)
          : [active],
      )
    : null;

  const shown = matching
    ? projects.filter((project) => matching.has(project.sector))
    : projects;

  const count =
    shown.length === 1
      ? labels.countOne
      : labels.countMany.replace("{n}", String(shown.length));

  const subFacets = activeParent?.children ?? [];

  // Sector -> label, from the leaves, for the badge on each card.
  const sectorLabels = new Map(
    facets
      .flatMap((facet) => [facet, ...(facet.children ?? [])])
      .map((facet) => [facet.value, facet.label]),
  );

  const tab = (isActive: boolean) =>
    cn(
      "inline-flex items-center px-4 py-2 text-sm font-bold no-underline wdth-body",
      "transition-colors duration-150",
      isActive
        ? "bg-asphalt text-concrete"
        : "text-steel-ink hover:bg-white hover:text-asphalt",
    );

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-rule pb-5 md:flex-row md:items-center md:justify-between">
        <nav aria-label={labels.filterLabel}>
          <ul className="flex flex-wrap gap-x-1 gap-y-2">
            <li>
              <Link
                href={href(null)}
                scroll={false}
                onClick={select(null)}
                aria-current={active === null ? "true" : undefined}
                className={tab(active === null)}
              >
                <RichText text={labels.all} />
              </Link>
            </li>
            {facets.map((facet) => {
              const isActive = activeParent?.value === facet.value;
              return (
                <li key={facet.value}>
                  <Link
                    href={href(facet.value)}
                    scroll={false}
                    onClick={select(facet.value)}
                    aria-current={isActive ? "true" : undefined}
                    className={tab(isActive)}
                  >
                    <RichText text={facet.label} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <p aria-live="polite" className="text-xs text-steel-ink tabular wdth-body">
          <RichText text={count} />
        </p>
      </div>

      {subFacets.length ? (
        <nav aria-label={labels.subFilterLabel} className="mt-4">
          <ul className="flex flex-wrap items-center gap-x-1 gap-y-2">
            {[{ value: activeParent!.value, label: labels.all }, ...subFacets].map(
              (facet) => {
                const isActive = active === facet.value;
                return (
                  <li key={facet.value}>
                    <Link
                      href={href(facet.value)}
                      scroll={false}
                      onClick={select(facet.value)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "inline-flex items-center px-3 py-1.5 text-xs font-semibold no-underline wdth-body",
                        "border transition-colors duration-150",
                        isActive
                          ? "border-asphalt bg-asphalt text-concrete"
                          : "border-rule text-steel-ink hover:border-steel hover:text-asphalt",
                      )}
                    >
                      <RichText text={facet.label} />
                    </Link>
                  </li>
                );
              },
            )}
          </ul>
        </nav>
      ) : null}

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((project) => (
          <li key={project.slug} className="contents">
            <ProjectCard
              project={project}
              sectorLabel={sectorLabels.get(project.sector) ?? project.sector}
              headingLevel={2}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
