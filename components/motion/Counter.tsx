"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef } from "react";

export interface CounterProps {
  value: number;
  /** Seconds. */
  duration?: number;
  className?: string;
}

/**
 * A figure that counts up to its value when it scrolls into view.
 *
 * The final value is in the HTML, so the number is right for a crawler, a
 * print stylesheet or a reader with scripts off. Before the first paint on a
 * client with motion enabled it is set to zero, and the count runs once the
 * figure is on screen. Under reduced motion it is simply the number.
 */
export function Counter({ value, duration = 1.6, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });

  useLayoutEffect(() => {
    if (reduced || !ref.current) return;
    ref.current.textContent = "0";
  }, [reduced]);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || !inView) return;

    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = String(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [inView, reduced, value, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
