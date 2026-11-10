"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { Button } from "../Button";
import { Eyebrow } from "../Eyebrow";
import { RichText } from "../RichText";
import type { ScanlineState } from "../webgl/ScanlineCanvas";
import type { ImageRef, Link as LinkContent } from "@/lib/content-types";
import { getGsap, motionEnabled } from "@/lib/gsap";
import { cn } from "@/lib/cn";

const ScanlineCanvas = dynamic(
  () => import("../webgl/ScanlineCanvas").then((mod) => mod.ScanlineCanvas),
  { ssr: false },
);

// Layout effects only in the browser; on the server they would warn.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface HomeHeroProps {
  eyebrow: string;
  /** The verbatim `h1`. */
  title: string;
  /** A leading part of the title set in the muted italic, if it begins with it. */
  titleMuted?: string;
  lead?: string;
  ctas: LinkContent[];
  image: ImageRef;
  /** "01" style index and caption printed on the resolved photograph. */
  caption?: string;
}

/**
 * The home hero.
 *
 * The title sits centred on the page; beneath it, a real photograph of Sato's
 * work comes up as ruled green lines, fading into the page — the treatment of
 * the references, on Sato's own material. As the reader scrolls, the stage
 * pins, the frame opens to the full width and height of the window, and the
 * lines resolve into the photograph a row at a time, top down: the drawing
 * becoming the work.
 *
 * On a phone there is no pin: the frame sits under the copy and resolves as
 * it passes through the screen. Under reduced motion, or without WebGL, it
 * is the photograph in its frame, nothing more.
 */
export function HomeHero({ eyebrow, title, titleMuted, lead, ctas, image, caption }: HomeHeroProps) {
  const stage = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const scan = useRef<ScanlineState>({ progress: 0, rect: [0, 0, 1, 1] });
  const [enhanced, setEnhanced] = useState(false);
  const [webgl, setWebgl] = useState<"pending" | "ready" | "failed">("pending");

  const muted = titleMuted && title.startsWith(titleMuted) ? titleMuted : "";
  const rest = muted ? title.slice(muted.length).trimStart() : title;

  useEffect(() => {
    // The enhanced stage is a client decision; the server renders the plain one.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (motionEnabled()) setEnhanced(true);
  }, []);

  // If the shader is slow to arrive, the photograph is shown rather than a gap.
  useEffect(() => {
    if (!enhanced || webgl !== "pending") return;
    const id = window.setTimeout(() => setWebgl((value) => (value === "pending" ? "failed" : value)), 3500);
    return () => window.clearTimeout(id);
  }, [enhanced, webgl]);

  useIsoLayoutEffect(() => {
    if (!enhanced || !stage.current || !copy.current || !frame.current) return;
    const { gsap } = getGsap();
    const mm = gsap.matchMedia();

    const header = () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) * 16 || 96;

    mm.add("(min-width: 768px)", () => {
      const el = stage.current!;
      const box = frame.current!;
      const text = copy.current!;
      const { ScrollTrigger } = getGsap();

      // Where the frame starts: under the copy, inside the page gutters.
      const geometry = () => {
        const h = el.clientHeight;
        const w = el.clientWidth;
        const gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gutter")) * 16 || 32;
        const top = Math.min(text.offsetTop + text.offsetHeight + 48, h * 0.7);
        return { h, w, top, side: gutter, bottom: gutter * 0.75 };
      };

      // One value, 0 → 1, drives both the clip on the frame and the rectangle
      // the shader fits the photograph to, so the two can never disagree.
      const open = { t: 0 };
      const apply = () => {
        const g = geometry();
        const k = 1 - open.t;
        const top = g.top * k;
        const side = g.side * k;
        const bottom = g.bottom * k;
        box.style.clipPath = `inset(${top}px ${side}px ${bottom}px ${side}px round ${6 * k}px)`;
        scan.current.rect = [side / g.w, bottom / g.h, 1 - side / g.w, 1 - top / g.h];
      };
      apply();

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: () => `top top+=${header()}`,
          end: "+=140%",
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          // The hero pins first; everything below measures from after it.
          refreshPriority: 10,
          onRefresh: apply,
        },
      });

      tl.to(text, { yPercent: -35, autoAlpha: 0, duration: 0.3 }, 0)
        .to(open, { t: 1, duration: 0.62, ease: "power2.inOut", onUpdate: apply }, 0)
        .fromTo(scan.current, { progress: 0 }, { progress: 1, duration: 0.5 }, 0.4)
        .fromTo(captionRef.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.88);

      ScrollTrigger.sort();
      ScrollTrigger.refresh();

      return () => {
        box.style.clipPath = "";
      };
    });

    mm.add("(max-width: 767px)", () => {
      const box = frame.current!;
      scan.current.rect = [0, 0, 1, 1];
      gsap.fromTo(
        scan.current,
        { progress: 0 },
        {
          progress: 1,
          ease: "none",
          scrollTrigger: { trigger: box, start: "top 70%", end: "bottom 45%", scrub: 0.5 },
        },
      );
      gsap.fromTo(
        captionRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, scrollTrigger: { trigger: box, start: "bottom 55%", toggleActions: "play none none reverse" } },
      );
    });

    return () => mm.revert();
  }, [enhanced]);

  const onReady = useCallback(() => setWebgl("ready"), []);
  const onFail = useCallback(() => setWebgl("failed"), []);

  const focal: [number, number] = [0.5, 0.55];
  const showPhoto = !enhanced || webgl === "failed";

  return (
    <section aria-labelledby="welcome-heading" className="relative bg-concrete">
      <div
        ref={stage}
        className={cn(
          "relative overflow-hidden",
          enhanced && "md:h-[calc(100svh-var(--header-height))] md:min-h-[44rem]",
        )}
      >
        <div
          ref={copy}
          className={cn(
            "relative z-10 mx-auto flex max-w-(--container-page) flex-col items-center px-(--gutter) pt-12 text-center md:pt-14 lg:pt-[6vh]",
            // From md up the copy lets the pointer through to the canvas beneath
            // (the lens), and only its links take clicks. On a phone the
            // frame sits below the copy, so nothing needs to pass through.
            enhanced && "md:pointer-events-none md:[&_a]:pointer-events-auto",
          )}
        >
          <div data-anim="fade">
            <Eyebrow text={eyebrow} tone="brand" />
          </div>

          <h1
            id="welcome-heading"
            data-anim="lines"
            data-delay={100}
            className="mt-6 max-w-[14ch] font-display text-[clamp(3rem,1.6rem+5.2vw,6.5rem)] leading-[0.94] tracking-[-0.028em] text-balance md:max-w-[22ch]"
          >
            {muted ? (
              <>
                <span className="serif-italic text-steel">
                  <RichText text={muted} />
                </span>{" "}
              </>
            ) : null}
            <RichText text={rest} />
          </h1>

          {lead ? (
            <p data-anim="fade" data-delay={450} className="mt-6 max-w-[58ch] text-lg text-steel-ink text-pretty">
              <RichText text={lead} />
            </p>
          ) : null}

          {ctas.length ? (
            <div data-anim="fade" data-delay={600} className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {ctas.map((cta, index) => (
                <Button key={cta.href} label={cta.label} href={cta.href} variant={index === 0 ? "primary" : "secondary"} />
              ))}
            </div>
          ) : null}
        </div>

        <div
          ref={frame}
          className={cn(
            "relative mx-(--gutter) mt-12 aspect-4/5 overflow-hidden rounded-(--radius-frame) sm:aspect-16/10",
            enhanced &&
              "md:absolute md:inset-0 md:mx-0 md:mt-0 md:aspect-auto md:rounded-none",
          )}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="100vw"
            className={cn("object-cover transition-opacity duration-700", showPhoto ? "opacity-100" : "opacity-0")}
            style={{ objectPosition: `${Math.round(focal[0] * 100)}% ${Math.round(focal[1] * 100)}%` }}
          />
          {enhanced ? (
            <ScanlineCanvas src={image.src} state={scan} focal={focal} onReady={onReady} onFail={onFail} />
          ) : null}

          {caption ? (
            <p
              ref={captionRef}
              className={cn(
                "eyebrow absolute bottom-4 left-4 z-10 flex items-center gap-3 rounded-full bg-concrete/90 px-4 py-2 text-asphalt backdrop-blur md:bottom-8 md:left-8",
                enhanced && "invisible",
              )}
            >
              <span aria-hidden="true" className="size-1.5 bg-brand-bright" />
              <RichText text={caption} />
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
