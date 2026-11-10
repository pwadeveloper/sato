"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/**
 * Motion, loaded once and loaded small.
 *
 * `LazyMotion` with the `domAnimation` feature set is the lean build of the
 * library: enough for the interactive pieces this site has (the nav panels,
 * the hover image switcher, the counters), without the layout-projection
 * engine the full build carries. `strict` throws if anything imports the
 * full `motion.div` instead of `m.div`, so the saving cannot quietly erode.
 *
 * `reducedMotion="user"` honours the OS setting across every Motion
 * animation in one place; the CSS reveals and the WebGL pieces check it for
 * themselves.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
