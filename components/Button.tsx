import Link from "next/link";
import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

const BASE =
  "inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold " +
  "wdth-body no-underline transition-colors duration-150 ease-out";

const VARIANTS = {
  /** Brand green fill. White on green is 5.4:1. */
  primary: "bg-green text-white hover:bg-green-deep active:bg-green-ink",
  /** Laterite outline — the warm secondary accent. */
  secondary:
    "border border-laterite text-laterite bg-transparent hover:bg-laterite hover:text-white",
  /** For use on asphalt sections, where an outline needs light ink. */
  inverse: "border border-concrete text-concrete bg-transparent hover:bg-concrete hover:text-asphalt",
} as const;

export interface ButtonProps {
  label: string;
  href?: string;
  variant?: keyof typeof VARIANTS;
  type?: "button" | "submit";
  /** Stretches to the container — used for the primary CTA at 360px. */
  block?: boolean;
  className?: string;
}

/** Renders an anchor when `href` is given, otherwise a real `<button>`. */
export function Button({
  label,
  href,
  variant = "primary",
  type = "button",
  block = false,
  className,
}: ButtonProps) {
  const classes = cn(BASE, VARIANTS[variant], block && "w-full", className);
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
