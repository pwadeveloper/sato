import Link from "next/link";
import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

const BASE =
  "group/button inline-flex items-center justify-center gap-3 font-mono font-medium uppercase " +
  "tracking-[0.12em] no-underline transition-colors duration-150 ease-out";

const SIZES = {
  /** The primary action. Deliberately chunky — the client asked for weight. */
  default: "px-6 py-4 text-[0.8125rem] leading-none",
  /** Smaller, for a row of several or a dark band's second action. */
  compact: "px-4 py-3 text-2xs leading-none",
} as const;

const VARIANTS = {
  /** Brand fill. White on brand is 5.9:1. */
  primary: "bg-brand text-white hover:bg-brand-deep active:bg-brand-ink",
  /** Outlined, in ink — the quieter second action on a light surface. */
  secondary:
    "border border-asphalt text-asphalt bg-transparent hover:bg-asphalt hover:text-concrete",
  /** For use on asphalt sections, where an outline needs light ink. */
  inverse:
    "border border-concrete text-concrete bg-transparent hover:bg-concrete hover:text-asphalt",
} as const;

export interface ButtonProps {
  label: string;
  href?: string;
  variant?: keyof typeof VARIANTS;
  type?: "button" | "submit";
  size?: keyof typeof SIZES;
  /** Stretches to the container — used for the primary CTA at 360px. */
  block?: boolean;
  /** The arrow after the label. On by default for a link, off for a form button. */
  arrow?: boolean;
  className?: string;
}

/**
 * Set in the mono, like a label on a drawing, with an arrow that moves on
 * hover. Renders an anchor when `href` is given, otherwise a real `<button>`.
 */
export function Button({
  label,
  href,
  variant = "primary",
  size = "default",
  type = "button",
  block = false,
  arrow,
  className,
}: ButtonProps) {
  const classes = cn(BASE, SIZES[size], VARIANTS[variant], block && "w-full", className);
  const showArrow = arrow ?? Boolean(href);
  const content = (
    <>
      <RichText text={label} />
      {showArrow ? (
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-500 ease-(--ease-out-expo) group-hover/button:translate-x-1 motion-reduce:transition-none"
        >
          &rarr;
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {content}
    </button>
  );
}
