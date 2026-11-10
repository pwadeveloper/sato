import { RichText } from "./RichText";
import type { Client } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ClientMarqueeProps {
  clients: Client[];
  label: string;
  className?: string;
}

/**
 * The clients' names, passing slowly across the page.
 *
 * Names only — the client's rule for the Clients page, kept here. The track
 * holds the list twice so the loop is seamless, the second copy hidden from
 * assistive technology; it pauses on hover and, under reduced motion,
 * becomes a wrapping list of the names.
 */
export function ClientMarquee({ clients, label, className }: ClientMarqueeProps) {
  const duration = `${Math.max(40, clients.length * 4)}s`;

  return (
    <div
      aria-label={label}
      role="region"
      className={cn(
        "overflow-hidden border-y border-rule py-5",
        "[mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]",
        className,
      )}
    >
      <div
        data-marquee=""
        className="flex w-max gap-x-12"
        style={{ "--marquee-duration": duration } as React.CSSProperties}
      >
        <ul className="flex shrink-0 gap-x-12">
          {clients.map((client) => (
            <li key={client.slug} className="whitespace-nowrap text-lg font-semibold text-asphalt wdth-heading">
              <RichText text={client.name} />
            </li>
          ))}
        </ul>
        <ul aria-hidden="true" data-marquee-copy="" className="flex shrink-0 gap-x-12">
          {clients.map((client) => (
            <li key={client.slug} className="whitespace-nowrap text-lg font-semibold text-asphalt wdth-heading">
              <RichText text={client.name} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
