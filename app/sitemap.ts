import type { MetadataRoute } from "next";
import { getProjects, getServices, getSite } from "@/lib/content";

export const dynamic = "force-static";

/**
 * Every indexable route, built from the content rather than a hand-kept list,
 * so a new project or division appears here the moment its JSON does.
 *
 * `/styleguide` is deliberately absent — it is a development reference, not a
 * page anyone should find in search. So is `/hse`, which is unpublished while
 * Sato reviews it with its oil and gas collaborator.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite();
  const base = site.url.replace(/\/+$/, "");
  const lastModified = new Date();

  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  ) => ({ url: `${base}${path}`, lastModified, changeFrequency, priority });

  return [
    entry("/", 1, "monthly"),
    entry("/about", 0.8, "yearly"),
    entry("/services", 0.9, "yearly"),
    entry("/services/infrastructure", 0.85, "yearly"),
    ...getServices().map((service) => entry(`/services/${service.slug}`, 0.8, "yearly")),
    entry("/projects", 0.9, "monthly"),
    ...getProjects().map((project) => entry(`/projects/${project.slug}`, 0.6, "yearly")),
    entry("/clients", 0.7, "yearly"),
    entry("/leadership", 0.7, "yearly"),
    entry("/contact", 0.8, "yearly"),
  ];
}
