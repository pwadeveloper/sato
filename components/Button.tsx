import Link from "next/link";
import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

const BASE =
  "inline-flex items-center justify-center gap-2 font-bold " +
  "wdth-body no-underline transition-colors duration-150 ease-out";

const SIZES = {
  /** The primary action. Deliberately chunky — the client asked for weight. */
  default: "px-7 py-4 text-base",
  /** Microtype with a hairline border — the hero's secondary action. */
  compact: "px-5 py-3 text-2xs uppercase tracking-[0.08em]",
} as const;

const VARIANTS = {
  /** Brand fill. White on brand is 5.9:1. */
  primary: "bg-brand text-white hover:bg-brand-deep active:bg-brand-ink",
  /** Outlined brand — the quieter secondary action on a light surface. */
  secondary:
    "border-2 border-brand text-brand-ink bg-transparent hover:bg-brand hover:text-white",
  /** For use on asphalt sections, where an outline needs light ink. */
  inverse:
    "border-2 border-concrete text-concrete bg-transparent hover:bg-concrete hover:text-asphalt",
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
