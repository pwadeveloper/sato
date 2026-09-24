import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = getSite().url.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // A development reference, not content.
        disallow: ["/styleguide"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
