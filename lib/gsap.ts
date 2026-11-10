import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;

/**
 * GSAP with its two plugins, registered once and only in the browser.
 * Every client component that animates goes through here, so the plugins
 * are never registered twice and never touched on the server.
 */
export function getGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    registered = true;
  }
  return { gsap, ScrollTrigger, SplitText };
}

/**
 * Whether motion is on: the inline script in the root layout sets
 * `html.motion` before first paint unless the reader has asked for reduced
 * motion. Everything animated checks this one flag.
 */
export function motionEnabled(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("motion")
  );
}
