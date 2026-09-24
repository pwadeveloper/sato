"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ProjectCard } from "./ProjectCard";
import { RichText } from "./RichText";
import type { CollectionFacet, Project } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ProjectFilterProps {
  projects: Project[];
  /** Sectors that actually have projects, in display order. */
  facets: CollectionFacet[];
  labels: {
    filterLabel: string;
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

/**
 * Sector filter for the project index.
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
  // An unknown sector falls back to showing everything.
  const active = facets.some((facet) => facet.value === requested)
    ? requested
    : null;

  const href = (value: string | null) =>
    value ? `${basePath}?${param}=${value}` : basePath;

  const select = (value: string | null) => (event: React.MouseEvent) => {
    // Let modified clicks (new tab, download) behave normally.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    pushSearch(href(value));
  };

  const shown = active
    ? projects.filter((project) => project.sector === active)
    : projects;

  const count =
    shown.length === 1
      ? labels.countOne
      : labels.countMany.replace("{n}", String(shown.length));

  const tabs: Array<{ value: string | null; label: string }> = [
    { value: null, label: labels.all },
    ...facets.map((facet) => ({ value: facet.value, label: facet.label })),
  ];

  const sectorLabels = new Map(facets.map((facet) => [facet.value, facet.label]));

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-rule pb-5 md:flex-row md:items-center md:justify-between">
        <nav aria-label={labels.filterLabel}>
          <ul className="flex flex-wrap gap-x-1 gap-y-2">
            {tabs.map((tab) => {
              const isActive = tab.value === active;
              return (
                <li key={tab.value ?? "all"}>
                  <Link
                    href={href(tab.value)}
                    scroll={false}
                    onClick={select(tab.value)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "inline-flex items-center px-4 py-2 text-sm font-semibold no-underline wdth-body",
                      "transition-colors duration-150",
                      isActive
                        ? "bg-asphalt text-concrete"
                        : "text-steel-ink hover:bg-white hover:text-asphalt",
                    )}
                  >
                    <RichText text={tab.label} />
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
