import Link from "next/link";
import { RichText } from "./RichText";
import { cn } from "@/lib/cn";

const TONES = {
  /** On concrete or white. green-ink is 5.8:1 / 7.3:1. */
  light: "text-green-ink hover:text-laterite decoration-green-ink/40 hover:decoration-laterite",
  /** On asphalt. green-light is 6.0:1. */
  dark: "text-green-light hover:text-survey decoration-green-light/40 hover:decoration-survey",
} as const;

export interface TextLinkProps {
  label: string;
  href: string;
  tone?: keyof typeof TONES;
  className?: string;
}

/**
 * Inline link. Underlined by default at a readable offset — no appended arrow,
 * and no colour-only affordance.
 */
export function TextLink({ label, href, tone = "light", className }: TextLinkProps) {
  const isExternal = /^https?:/.test(href);
  const classes = cn(
    "font-medium underline underline-offset-[0.2em] decoration-1 transition-colors duration-150",
    TONES[tone],
    className,
  );

  if (isExternal) {
    return (
      <a href={href} rel="noopener noreferrer" target="_blank" className={classes}>
        <RichText text={label} />
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      <RichText text={label} />
    </Link>
  );
}
