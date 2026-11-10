import Link from "next/link";
import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

const BASE =
  "group/button relative inline-flex items-center justify-center gap-3 overflow-hidden " +
  "font-mono text-[0.72rem] font-medium uppercase tracking-[0.1em] leading-none no-underline " +
  "transition-colors duration-300 ease-out";

const SIZES = {
  default: "h-12 px-6",
  compact: "h-10 px-4",
} as const;

const VARIANTS = {
  /** Ink. The primary action on a light page. White on ink is 18:1. */
  primary: "bg-asphalt text-white hover:bg-brand",
  /** Outlined in ink — the second action on a light page. */
  secondary: "border border-asphalt/20 text-asphalt hover:border-asphalt hover:bg-asphalt hover:text-white",
  /** Solid white — the primary action on a dark band. */
  light: "bg-white text-asphalt hover:bg-brand-light",
  /** Outlined in white — the second action on a dark band. */
  inverse: "border border-white/25 text-white hover:border-white hover:bg-white hover:text-asphalt",
} as const;

export interface ButtonProps {
  label: string;
  href?: string;
  variant?: keyof typeof VARIANTS;
  type?: "button" | "submit";
  size?: keyof typeof SIZES;
  block?: boolean;
  /** The arrow after the label. On by default for a link, off for a form button. */
  arrow?: boolean;
  className?: string;
}

/**
 * A label in the mono with an arrow that slides through on hover. Renders an
 * anchor when `href` is given, otherwise a real `<button>`.
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
        <span aria-hidden="true" className="relative inline-block h-[1em] w-[1.1em] overflow-hidden">
          <span className="absolute inset-0 transition-transform duration-500 ease-(--ease-out-expo) group-hover/button:translate-x-full motion-reduce:transition-none">
            &rarr;
          </span>
          <span className="absolute inset-0 -translate-x-full transition-transform duration-500 ease-(--ease-out-expo) group-hover/button:translate-x-0 motion-reduce:transition-none">
            &rarr;
          </span>
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
