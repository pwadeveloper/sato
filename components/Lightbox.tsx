"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ImageRef } from "@/lib/content-types";
import { cn } from "@/lib/cn";
import { RichText } from "./RichText";

export interface LightboxLabels {
  /** aria-label of the close button, e.g. "Close". */
  close: string;
  /** aria-label of the next button. */
  next: string;
  /** aria-label of the previous button. */
  previous: string;
  /**
   * "Photograph {n} of {total}" — both tokens are replaced. Shown as the
   * counter under the picture and used as the dialog's own label, so a screen
   * reader hears where it is the moment the lightbox opens.
   */
  counter: string;
  /** What a trigger does, read to screen readers only, e.g. "View larger". */
  open: string;
}

export interface LightboxProviderProps {
  images: ImageRef[];
  labels: LightboxLabels;
  children: ReactNode;
}

export interface LightboxTriggerProps {
  /** Index into the provider's `images`. */
  index: number;
  className?: string;
  children: ReactNode;
}

interface LightboxContextValue {
  open: (index: number, trigger: HTMLElement | null) => void;
  openLabel: string;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

function useLightbox(): LightboxContextValue {
  const value = useContext(LightboxContext);
  if (!value) {
    throw new Error("LightboxTrigger must be rendered inside a LightboxProvider.");
  }
  return value;
}

/** The fade on the dialog; keep in step with `duration-200` below. */
const FADE_MS = 200;
/** How far a pointer must travel sideways before it counts as a swipe. */
const SWIPE_PX = 48;

function counterText(template: string, n: number, total: number): string {
  return template.replace(/\{n\}/g, String(n)).replace(/\{total\}/g, String(total));
}

/** Width over height, falling back to 3:2 when the content has no dimensions. */
function ratioOf(image: ImageRef): number {
  const { width, height } = image;
  if (width && height && width > 0 && height > 0) return width / height;
  return 3 / 2;
}

/**
 * The gallery lightbox: the image set and the open state, with the dialog
 * rendered once after the children.
 *
 * Split into a provider, a trigger and the dialog so a server-rendered
 * gallery can wrap each of its image boxes in a `LightboxTrigger` without
 * becoming a client component itself; only this file ships to the browser.
 *
 * It is a native `<dialog>` opened with `showModal()`, which is where the
 * focus trap, the Escape key and the inert page come from. Escape arrives as
 * the `cancel` event, the close button and a click on the dark surface call
 * the same fade-out, and the native `close` event is the one place the state
 * is settled — so the three ways of closing cannot drift apart, and a close
 * the browser forces on its own still lands correctly.
 */
export function LightboxProvider({ images, labels, children }: LightboxProviderProps) {
  const [index, setIndex] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  /** The trigger that opened the dialog; focus goes back to it on close. */
  const returnTo = useRef<HTMLElement | null>(null);
  /** True from the start of the fade-out until the `close` event. */
  const closing = useRef(false);
  const swipe = useRef<{ id: number; x: number } | null>(null);
  /** Set when a pointer sequence was a swipe, so its trailing click is ignored. */
  const swiped = useRef(false);

  const total = images.length;
  const isOpen = index !== null;

  const open = useCallback(
    (at: number, trigger: HTMLElement | null) => {
      if (total === 0) return;
      returnTo.current = trigger;
      closing.current = false;
      setIndex(Math.min(Math.max(at, 0), total - 1));
    },
    [total],
  );

  const step = useCallback(
    (delta: number) => {
      if (total < 2) return;
      setIndex((current) =>
        current === null ? current : (current + delta + total) % total,
      );
    },
    [total],
  );

  /** Fade the dialog out, then close it; the `close` event settles the state. */
  const requestClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open || closing.current) return;
    closing.current = true;
    setShown(false);

    // Nothing to wait for when motion is off: the transition is disabled and
    // `transitionend` would never fire.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.close();
      return;
    }

    let timer = 0;
    const onEnd = (event: TransitionEvent) => {
      if (event.target === dialog && event.propertyName === "opacity") finish();
    };
    const finish = () => {
      dialog.removeEventListener("transitionend", onEnd);
      window.clearTimeout(timer);
      dialog.close();
    };
    dialog.addEventListener("transitionend", onEnd);
    // If the fade never ran (closed before it had begun), close anyway.
    timer = window.setTimeout(finish, FADE_MS + 50);
  }, []);

  // Open the native dialog, start the fade-in and lock the page behind it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;

    if (!dialog.open) dialog.showModal();
    closeButtonRef.current?.focus();

    // Flush the styles once while the dialog is still at opacity 0, so the
    // class change that follows is a transition rather than a jump.
    dialog.getBoundingClientRect();
    const frame = window.requestAnimationFrame(() => {
      if (!closing.current) setShown(true);
    });

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    return () => {
      window.cancelAnimationFrame(frame);
      root.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Arrow keys step through the set. Escape is the dialog's own `cancel`.
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, step]);

  const contextValue = useMemo<LightboxContextValue>(
    () => ({ open, openLabel: labels.open }),
    [open, labels.open],
  );

  const current = index === null ? null : images[index];
  const label =
    index === null ? undefined : counterText(labels.counter, index + 1, total);

  // The current photograph and its two neighbours, so a step is instant. Keys
  // are indices: an image that was "next" keeps its element when it becomes
  // "current", and nothing is decoded twice.
  const mounted: number[] = [];
  if (index !== null && total > 0) {
    const wanted = new Set([index, (index - 1 + total) % total, (index + 1) % total]);
    mounted.push(...Array.from(wanted).sort((a, b) => a - b));
  }

  const ratio = current ? ratioOf(current) : 3 / 2;

  return (
    <LightboxContext.Provider value={contextValue}>
      {children}
      <dialog
        ref={dialogRef}
        aria-label={label}
        onCancel={(event) => {
          // Escape: run the same fade-out as the close button.
          event.preventDefault();
          requestClose();
        }}
        onClose={() => {
          closing.current = false;
          setShown(false);
          setIndex(null);
          const target = returnTo.current;
          returnTo.current = null;
          target?.focus();
        }}
        onClick={(event) => {
          if (swiped.current) {
            swiped.current = false;
            return;
          }
          // The dark surface itself, not anything laid on it.
          if (event.target === event.currentTarget) requestClose();
        }}
        onPointerDown={(event) => {
          swipe.current = null;
          swiped.current = false;
          if (!event.isPrimary || event.button !== 0) return;
          // A drag that starts on a control is that control's business.
          if ((event.target as Element).closest("button")) return;
          swipe.current = { id: event.pointerId, x: event.clientX };
        }}
        onPointerUp={(event) => {
          const start = swipe.current;
          swipe.current = null;
          if (!start || start.id !== event.pointerId) return;
          const dx = event.clientX - start.x;
          if (Math.abs(dx) <= SWIPE_PX) return;
          swiped.current = true;
          step(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => {
          swipe.current = null;
        }}
        className={cn(
          // Override the UA dialog box: it is the whole viewport, nothing less.
          "fixed inset-0 m-0 h-full w-full max-h-none max-w-none border-0 p-0",
          "bg-asphalt text-concrete backdrop:bg-transparent",
          // Centred by auto margins on the child, so an overflowing figure
          // scrolls rather than being clipped at the top.
          "open:flex flex-col overflow-y-auto overscroll-contain",
          "px-3 pb-4 pt-14 md:px-24 md:pb-6 md:pt-16",
          "touch-pan-y select-none",
          "transition-opacity duration-200 ease-out-quiet motion-reduce:transition-none",
          shown ? "opacity-100" : "opacity-0",
        )}
      >
        {current && index !== null ? (
          <>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label={labels.close}
              onClick={requestClose}
              className={cn(controlClass, "right-2 top-2 md:right-6 md:top-6")}
            >
              <CrossIcon />
            </button>

            {total > 1 ? (
              <>
                <button
                  type="button"
                  aria-label={labels.previous}
                  onClick={() => step(-1)}
                  className={cn(
                    controlClass,
                    "left-2 top-1/2 -translate-y-1/2 md:left-6 md:size-14",
                  )}
                >
                  <ChevronIcon direction="left" />
                </button>
                <button
                  type="button"
                  aria-label={labels.next}
                  onClick={() => step(1)}
                  className={cn(
                    controlClass,
                    "right-2 top-1/2 -translate-y-1/2 md:right-6 md:size-14",
                  )}
                >
                  <ChevronIcon direction="right" />
                </button>
              </>
            ) : null}

            {/*
              As wide as the gutters allow, but never so wide that the picture
              would stand taller than 82svh — the width is the aspect ratio
              solved for that height, so the box always fits the photograph
              exactly and there is no dead letterbox to click.
            */}
            <div
              className="m-auto w-full max-w-full"
              style={{ width: `min(100%, calc(82svh * ${ratio}))` }}
            >
              <div
                className="relative w-full max-h-[82svh] overflow-hidden bg-asphalt-raised"
                style={{ aspectRatio: ratio }}
              >
                {mounted.map((i) => {
                  const image = images[i];
                  const isCurrent = i === index;
                  return (
                    <Image
                      key={i}
                      src={image.src}
                      alt={isCurrent ? image.alt : ""}
                      aria-hidden={isCurrent ? undefined : true}
                      fill
                      sizes="100vw"
                      loading="eager"
                      draggable={false}
                      className={cn(
                        "object-contain",
                        isCurrent ? "opacity-100" : "opacity-0",
                      )}
                    />
                  );
                })}
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-6">
                {current.caption ? (
                  <RichText
                    as="p"
                    text={current.caption}
                    className="text-sm text-concrete wdth-body text-pretty"
                  />
                ) : null}
                <p
                  aria-live="polite"
                  className="ml-auto shrink-0 font-mono text-2xs uppercase tracking-[0.12em] text-steel-light tabular"
                >
                  {label}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </dialog>
    </LightboxContext.Provider>
  );
}

/**
 * A real button around a figure's image box; opens the lightbox at `index`.
 *
 * It carries no `aria-label` of its own — the image inside already says what
 * it is — and adds the action as hidden text after it. Pointer users get a
 * corner glyph on hover; touch users just tap the picture.
 */
export function LightboxTrigger({ index, className, children }: LightboxTriggerProps) {
  const { open, openLabel } = useLightbox();

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={(event) => open(index, event.currentTarget)}
      className={cn("group relative block w-full cursor-pointer text-left", className)}
    >
      {children}
      <span className="sr-only">
        <RichText text={openLabel} />
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2 right-2 flex size-7 items-center justify-center bg-concrete/90 text-asphalt opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
      >
        <ExpandIcon />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------ internals */

/** Shared look of the three dialog controls; each adds its own position. */
const controlClass =
  "fixed z-10 flex size-11 items-center justify-center border border-rule-dark " +
  "bg-asphalt/85 text-concrete transition-colors duration-150 " +
  "hover:border-steel hover:bg-asphalt-raised motion-reduce:transition-none";

function CrossIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9V3h6M15 3h6v6M21 15v6h-6M9 21H3v-6" />
    </svg>
  );
}
