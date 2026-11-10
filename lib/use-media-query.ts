"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether a media query matches, as a store rather than as state set from
 * an effect — so there is no second render after mount, and the subscription
 * follows the query if it changes.
 *
 * The server has no viewport and answers `false`; the client takes over
 * with the real answer on hydration.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
