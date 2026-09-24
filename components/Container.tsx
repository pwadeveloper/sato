import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const WIDTHS = {
  /** 1280px — the standard page measure. */
  default: "max-w-(--container-page)",
  /** 68ch — prose, kept under the 75-character ceiling. */
  narrow: "max-w-(--container-measure)",
  /** No cap; the gutters still apply. */
  wide: "max-w-none",
} as const;

export interface ContainerProps {
  children: ReactNode;
  width?: keyof typeof WIDTHS;
  className?: string;
}

/** Horizontal gutters: 20px at 360, 32px at 768, 48px at 1280. */
export function Container({
  children,
  width = "default",
  className,
}: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-5 md:px-8 lg:px-12", WIDTHS[width], className)}>
      {children}
    </div>
  );
}
