import { RichText } from "./RichText";
import type { Client } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ClientMarqueeProps {
  clients: Client[];
  label: string;
  /** Run the other way — two rows passing each other. */
  reverse?: boolean;
  className?: string;
}

/**
 * The clients' names, passing slowly across the page in the display face.
 *
 * Names only — the client's rule for the Clients page. The track holds the
 * list twice so the loop is seamless, the second copy hidden from assistive
 * technology; it pauses on hover and, under reduced motion, becomes a
 * wrapping list.
 */
export function ClientMarquee({ clients, label, reverse = false, className }: ClientMarqueeProps) {
  const duration = `${Math.max(36, clients.length * 6)}s`;
  const item = "flex items-center gap-10 whitespace-nowrap font-display text-[clamp(2rem,1.4rem+2.2vw,3.75rem)] leading-none tracking-[-0.02em] text-asphalt/35 transition-colors duration-500 hover:text-asphalt";
  const dot = <span aria-hidden="true" className="size-2 rounded-full bg-brand-bright/70" />;

  return (
    <div
      aria-label={label}
      role="region"
      className={cn("overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]", className)}
    >
      <div
        data-marquee={reverse ? "reverse" : ""}
        className="flex w-max gap-x-10"
        style={{ "--marquee-duration": duration } as React.CSSProperties}
      >
        <ul className="flex shrink-0 gap-x-10">
          {clients.map((client) => (
            <li key={client.slug} className={item}>
              <RichText text={client.name} />
              {dot}
            </li>
          ))}
        </ul>
        <ul aria-hidden="true" data-marquee-copy="" className="flex shrink-0 gap-x-10">
          {clients.map((client) => (
            <li key={client.slug} className={item}>
              <RichText text={client.name} />
              {dot}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
