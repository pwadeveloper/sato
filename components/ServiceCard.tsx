import Image from "next/image";
import Link from "next/link";
import { RichText } from "./RichText";
import type { Service } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ServiceCardProps {
  service: Service;
  /**
   * `featured` carries photography and is used for the established divisions.
   * `compact` is the text-only treatment for divisions whose content is still
   * being confirmed.
   */
  variant?: "featured" | "compact";
  headingLevel?: 2 | 3;
  /** Set on the first featured card, which is the LCP element on /services. */
  priority?: boolean;
  className?: string;
}

export function ServiceCard({
  service,
  variant = "featured",
  headingLevel = 3,
  priority = false,
  className,
}: ServiceCardProps) {
  const NameTag = `h${headingLevel}` as const;
  const isFeatured = variant === "featured";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col border border-rule bg-white transition-colors duration-150",
        "hover:border-steel focus-within:border-steel",
        className,
      )}
    >
      {isFeatured && service.image ? (
        <div className="relative aspect-4/3 w-full overflow-hidden bg-steel/10">
          <Image
            src={service.image.src}
            alt={service.image.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority={priority}
            className="object-cover"
          />
        </div>
      ) : (
        <div aria-hidden="true" className="h-[3px] w-full bg-laterite" />
      )}

      <div className="flex flex-1 flex-col gap-3 p-6 md:p-8">
        <NameTag className={cn("wdth-heading text-balance", isFeatured ? "text-h2" : "text-h3")}>
          <Link
            href={`/services/${service.slug}`}
            className="no-underline after:absolute after:inset-0 after:content-['']"
          >
            <RichText text={service.name} />
          </Link>
        </NameTag>

        <p className="text-base text-steel-ink wdth-body">
          <RichText text={isFeatured ? service.summary : service.shortSummary} />
        </p>
      </div>
    </article>
  );
}
