"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getGsap, motionEnabled } from "@/lib/gsap";

/** One Lenis for the whole visit; route changes re-sync it rather than rebuild it. */
let lenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenis;
}

const delayOf = (el: Element) => Number(el.getAttribute("data-delay") ?? 0) / 1000;

/**
 * The motion layer, for the whole site, in one place.
 *
 * Server components mark what moves with a `data-anim` attribute and nothing
 * else; this reads the attributes after every route change and builds the
 * GSAP timelines for them. So a heading is still a server-rendered `<h2>`
 * with its text in the HTML, and the motion is an enhancement laid over it.
 *
 * - `lines`        the text rises a line at a time out of a clipped box
 * - `fade`         the block rises and fades in
 * - `stagger`      each direct child of the block rises in turn
 * - `image`        a photograph frame wipes open from the bottom, the
 *                  picture settling from a slight zoom
 * - `parallax`     the picture inside a frame drifts against the scroll
 * - `scrub-words`  a paragraph lights up word by word as it is read
 * - `count`        a figure counts up to `data-value`
 *
 * Lenis smooths the wheel on a desktop; touch scrolling is left native.
 * None of it runs under reduced motion: `html.motion` is never set, and the
 * page is the plain HTML.
 */
export function MotionRuntime() {
  const pathname = usePathname();

  // Lenis, once.
  useEffect(() => {
    if (!motionEnabled() || lenis) return;
    const { gsap, ScrollTrigger } = getGsap();

    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: { offset: -96 },
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // The nav panels and the lightbox lock the page by setting overflow on
    // <html> or <body>; Lenis drives the scroll itself, so it is told to stop.
    const html = document.documentElement;
    const locked = () =>
      html.style.overflow === "hidden" || document.body.style.overflow === "hidden";
    const observer = new MutationObserver(() => {
      if (locked()) lenis?.stop();
      else lenis?.start();
    });
    observer.observe(html, { attributes: true, attributeFilter: ["style"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });
  }, []);

  // The page's own animations, rebuilt for every route.
  useEffect(() => {
    if (!motionEnabled()) return;
    const { gsap, ScrollTrigger, SplitText } = getGsap();

    // Next has already placed the scroll for the new page; Lenis follows it.
    lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
    lenis?.resize();

    let ctx: ReturnType<typeof gsap.context> | null = null;
    let cancelled = false;

    const build = () => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const at = (el: Element, start = "top 88%") => ({
          trigger: el,
          start,
          once: true,
        });

        gsap.utils.toArray<HTMLElement>('[data-anim="lines"]').forEach((el) => {
          gsap.set(el, { visibility: "visible" });
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 112,
                duration: 1.25,
                ease: "expo.out",
                stagger: 0.09,
                delay: delayOf(el),
                scrollTrigger: at(el),
              }),
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-anim="fade"]').forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 28 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.1,
              ease: "expo.out",
              delay: delayOf(el),
              scrollTrigger: at(el),
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-anim="stagger"]').forEach((el) => {
          gsap.set(el, { visibility: "visible" });
          gsap.fromTo(
            el.children,
            { autoAlpha: 0, y: 36 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.1,
              ease: "expo.out",
              stagger: 0.08,
              delay: delayOf(el),
              scrollTrigger: at(el, "top 90%"),
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-anim="image"]').forEach((el) => {
          // A frame with a parallax layer inside leaves the picture's scale to it.
          const img = el.querySelector('[data-anim="parallax"]') ? null : el.querySelector("img");
          const tl = gsap.timeline({ delay: delayOf(el), scrollTrigger: at(el, "top 92%") });
          tl.fromTo(
            el,
            { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.35, ease: "expo.inOut" },
          );
          if (img) tl.fromTo(img, { scale: 1.22 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0.1);
        });

        gsap.utils.toArray<HTMLElement>('[data-anim="parallax"]').forEach((el) => {
          const img = el.querySelector("img");
          if (!img) return;
          gsap.fromTo(
            img,
            { yPercent: -7, scale: 1.16 },
            {
              yPercent: 7,
              scale: 1.16,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-anim="scrub-words"]').forEach((el) => {
          SplitText.create(el, {
            type: "words",
            autoSplit: true,
            onSplit: (self) =>
              gsap.fromTo(
                self.words,
                { opacity: 0.14 },
                {
                  opacity: 1,
                  ease: "none",
                  stagger: 0.1,
                  scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 50%", scrub: true },
                },
              ),
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-anim="count"]').forEach((el) => {
          const value = Number(el.getAttribute("data-value") ?? el.textContent ?? 0);
          const counter = { n: 0 };
          gsap.set(el, { visibility: "visible" });
          el.textContent = "0";
          gsap.to(counter, {
            n: value,
            duration: 2,
            ease: "expo.out",
            scrollTrigger: at(el),
            onUpdate: () => {
              el.textContent = String(Math.round(counter.n));
            },
          });
        });
      });

      ScrollTrigger.refresh();
    };

    // Lines are measured, so the display face has to be in before splitting.
    if (document.fonts?.status === "loaded") build();
    else document.fonts.ready.then(build);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
      ctx?.revert();
    };
  }, [pathname]);

  return null;
}
