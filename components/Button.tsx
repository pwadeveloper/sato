import Link from "next/link";
import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold " +
  "wdth-body no-underline transition-colors duration-150 ease-out";

const SIZES = {
  default: "px-6 py-3 text-base",
  /** Microtype with a hairline border — the hero's secondary action. */
  compact: "px-4 py-2.5 text-2xs uppercase tracking-[0.08em]",
} as const;

const VARIANTS = {
  /** Brand brand fill. White on brand is 5.4:1. */
  primary: "bg-brand text-white hover:bg-brand-deep active:bg-brand-ink",
  /** Laterite outline — the warm secondary accent. */
  secondary:
    "border border-brand-deep text-brand-deep bg-transparent hover:bg-brand-deep hover:text-white",
  /** For use on asphalt sections, where an outline needs light ink. */
  inverse: "border border-concrete text-concrete bg-transparent hover:bg-concrete hover:text-asphalt",
} as const;

export interface ButtonProps {
  label: string;
  href?: string;
  variant?: keyof typeof VARIANTS;
  type?: "button" | "submit";
  size?: keyof typeof SIZES;
  /** Stretches to the container — used for the primary CTA at 360px. */
  block?: boolean;
  className?: string;
}

/** Renders an anchor when `href` is given, otherwise a real `<button>`. */
export function Button({
  label,
  href,
  variant = "primary",
  size = "default",
  type = "button",
  block = false,
  className,
}: ButtonProps) {
  const classes = cn(BASE, SIZES[size], VARIANTS[variant], block && "w-full", className);
  const content = <RichText text={label} />;

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
