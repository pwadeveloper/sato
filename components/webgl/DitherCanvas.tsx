"use client";

/**
 * DitherCanvas — the photograph develops from the drawing.
 *
 * A WebGL overlay laid over a normal `<img>` of the same photograph. It starts
 * as a two-tone ordered-dither rendering of the picture — an 8×8 Bayer matrix,
 * dark ink dots on the page colour, like a halftone engineering print — and
 * then resolves grain-by-grain into the real photograph. Once resolved, the
 * pointer becomes a soft lens that re-dithers the area under it, showing the
 * drawing beneath the finished work, and settles back when it leaves.
 *
 * Why raw three rather than a fiber wrapper: it is one quad, one material and
 * ten uniforms. The scene graph is incidental; what matters is owning the
 * render loop so that a resolved, idle canvas renders no frames at all.
 *
 * Colour fidelity: the resolved frame has to match the `<img>` beneath it
 * pixel for pixel, otherwise the hand-off at the end of the resolve shows as a
 * tint shift. So the texture is uploaded with `NoColorSpace` (raw encoded
 * bytes, no sRGB decode on sample), the shader has no colour-space chunks, no
 * tone mapping touches it, and the sampled colour is written straight to
 * `gl_FragColor`. Ink and paper go in as the same encoded values the CSS uses.
 *
 * Behaviour when it cannot run: under `prefers-reduced-motion: reduce` or
 * when a WebGL context cannot be created, the component renders nothing and
 * never creates a context. If the texture fails to load, the canvas stays at
 * opacity 0 and the `<img>` beneath carries the page. Nothing here throws.
 */

import { useEffect, useRef, useState, useSyncExternalStore, type JSX } from "react";
import {
  Color,
  LinearFilter,
  Mesh,
  NoColorSpace,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Texture,
} from "three";
import { cn } from "@/lib/cn";

export interface DitherCanvasProps {
  /** Same-origin URL of the photograph (a .webp under /images). */
  src: string;
  className?: string;
  /** Milliseconds to wait after the texture loads before resolving starts. Default 350. */
  resolveDelayMs?: number;
  /**
   * Instead of a delay from texture load, a moment on the page's own clock
   * (`performance.now()` milliseconds) at which the resolve should begin.
   * Anchors the development to the page paint rather than to the network,
   * so the photograph's CSS pre-state and the shader agree on the timeline;
   * a texture that arrives late joins the resolve already in progress.
   */
  resolveAtMs?: number;
  /** Milliseconds the dither-to-photo resolve takes. Default 1600. */
  resolveDurationMs?: number;
  /** Called once the photo has fully resolved. */
  onResolved?: () => void;
}

/* ------------------------------------------------------------------------ */
/* Tuning                                                                    */
/* ------------------------------------------------------------------------ */

/** Dither cell in CSS pixels; multiplied by the device pixel ratio and rounded so every dot is crisp. */
const CELL_CSS_PX = 3.5;
/** Lens radius as a fraction of the canvas width. */
const LENS_RADIUS = 0.22;
/** Per-frame lerp of the lens strength toward its target. */
const LENS_EASE = 0.08;
/** Below this gap the lens snaps to its target and the loop may idle. */
const LENS_EPSILON = 0.002;
/** Per-frame lerp of the lens centre toward the pointer, so it glides rather than jumps. */
const POINTER_EASE = 0.18;
const POINTER_EPSILON = 0.0005;
/** A frame delta is never counted as longer than this, so a hidden tab pauses the resolve instead of skipping it. */
const MAX_FRAME_MS = 64;

const INK_VAR = "--color-brand-deep";
const INK_FALLBACK = "#1c5718";
const PAPER_VAR = "--color-concrete";
const PAPER_FALLBACK = "#e9e6e1";

/* ------------------------------------------------------------------------ */
/* Shaders                                                                   */
/* ------------------------------------------------------------------------ */

// The quad is already in clip space (-1..1), so the camera matrices are not
// applied; the OrthographicCamera exists only to satisfy renderer.render().
const VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// three prepends "#version 300 es" and maps texture2D/gl_FragColor/varying to
// their ES 3.00 forms, which is what allows the const array below.
const FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D uTexture;
uniform float uTexAspect;
uniform float uCanvasAspect;
uniform float uProgress;
uniform vec2 uPointer;
uniform float uLens;
uniform float uTime;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform float uCell;

varying vec2 vUv;

// 8×8 Bayer ordered-dither thresholds, row-major, in 64ths.
const float BAYER[64] = float[64](
   0.0, 32.0,  8.0, 40.0,  2.0, 34.0, 10.0, 42.0,
  48.0, 16.0, 56.0, 24.0, 50.0, 18.0, 58.0, 26.0,
  12.0, 44.0,  4.0, 36.0, 14.0, 46.0,  6.0, 38.0,
  60.0, 28.0, 52.0, 20.0, 62.0, 30.0, 54.0, 22.0,
   3.0, 35.0, 11.0, 43.0,  1.0, 33.0,  9.0, 41.0,
  51.0, 19.0, 59.0, 27.0, 49.0, 17.0, 57.0, 25.0,
  15.0, 47.0,  7.0, 39.0, 13.0, 45.0,  5.0, 37.0,
  63.0, 31.0, 55.0, 23.0, 61.0, 29.0, 53.0, 21.0
);

// Cheap, driver-stable 2D hash (no sin), seeded by integer cell coordinates.
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// CSS object-fit: cover, centred: shrink the UV span of the axis on which the
// texture overflows the canvas, so the picture is cropped rather than squashed.
vec2 coverUv(vec2 uv) {
  vec2 s = vec2(1.0);
  if (uTexAspect > uCanvasAspect) {
    s.x = uCanvasAspect / uTexAspect;
  } else {
    s.y = uTexAspect / uCanvasAspect;
  }
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec3 photo = texture2D(uTexture, coverUv(vUv)).rgb;

  // Ordered dither. Luminance by Rec. 709 weights, lifted a touch so the mid
  // greys split into dots rather than sitting on the threshold.
  float lum = dot(photo, vec3(0.2126, 0.7152, 0.0722));
  lum = clamp(pow(lum, 0.9) * 1.05, 0.0, 1.0);
  ivec2 cell = ivec2(mod(floor(gl_FragCoord.xy / uCell), 8.0));
  float threshold = (BAYER[cell.y * 8 + cell.x] + 0.5) / 64.0;
  vec3 dithered = mix(uInk, uPaper, step(threshold, lum));

  // Resolve. Each cluster of 2×2 dither cells draws one reveal threshold from
  // the hash, blended a quarter toward a left→right / top→bottom ramp so the
  // development has a direction. uProgress is stretched to -0.12..1.12 so the
  // ±0.12 smoothstep is fully off at 0 and fully on at 1 for every cluster.
  vec2 cluster = floor(gl_FragCoord.xy / (uCell * 2.0));
  float grain = hash12(cluster);
  float ramp = (vUv.x + (1.0 - vUv.y)) * 0.5;
  float reveal_t = mix(grain, ramp, 0.25);
  // A faint shimmer at the development front only; zero at rest, so an idle
  // frame is identical to the one before it.
  reveal_t += sin(uTime * 7.0 + grain * 6.2831) * 0.02 * (4.0 * uProgress * (1.0 - uProgress));
  float p = mix(-0.12, 1.12, uProgress);
  float reveal = smoothstep(reveal_t - 0.12, reveal_t + 0.12, p);

  // Lens. Distances are measured in canvas-width units so the lens is round
  // whatever the aspect; the mask is 1 at the centre and feathers to 0 at r.
  vec2 aspect = vec2(1.0, 1.0 / uCanvasAspect);
  float d = distance(vUv * aspect, uPointer * aspect);
  float lensMask = 1.0 - smoothstep(${(LENS_RADIUS * 0.35).toFixed(4)}, ${LENS_RADIUS.toFixed(4)}, d);
  reveal = max(reveal * (1.0 - lensMask * uLens), 0.0);

  gl_FragColor = vec4(mix(dithered, photo, reveal), 1.0);
}
`;

/* ------------------------------------------------------------------------ */
/* Helpers                                                                   */
/* ------------------------------------------------------------------------ */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerReducedMotion(): boolean {
  return false;
}

/** `#rgb` or `#rrggbb` → components in 0..1, as encoded (no colour-space conversion). */
function hexToVector3(hex: string): Vector3 | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const digits = match[1].length === 3 ? match[1].replace(/./g, (c) => c + c) : match[1];
  const n = parseInt(digits, 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** Reads a hex colour token from `:root`, falling back when it is absent or not hex. */
function readColorToken(name: string, fallback: string): { vec: Vector3; hex: string } {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const vec = hexToVector3(raw);
  if (vec) return { vec, hex: raw };
  return { vec: hexToVector3(fallback) ?? new Vector3(0, 0, 0), hex: fallback };
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ------------------------------------------------------------------------ */
/* Component                                                                 */
/* ------------------------------------------------------------------------ */

export function DitherCanvas({
  src,
  className,
  resolveDelayMs = 350,
  resolveAtMs,
  resolveDurationMs = 1600,
  onResolved,
}: DitherCanvasProps): JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onResolvedRef = useRef(onResolved);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );
  // Only the constructor can tell us a context is unavailable; set from the effect.
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    onResolvedRef.current = onResolved;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    // Belt and braces with the store above: never create a context under reduced motion.
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
        // A software-rasterised context would spend CPU on a decoration; let the <img> carry it instead.
        failIfMajorPerformanceCaveat: true,
      });
    } catch {
      // Report on the next tick so React can unmount the canvas; the effect
      // body itself must stay free of synchronous state updates.
      const id = window.setTimeout(() => setWebglUnavailable(true), 0);
      return () => window.clearTimeout(id);
    }

    const ink = readColorToken(INK_VAR, INK_FALLBACK);
    const paper = readColorToken(PAPER_VAR, PAPER_FALLBACK);
    renderer.setClearColor(new Color(paper.hex));

    const state = {
      loaded: false,
      presented: false,
      elapsed: 0,
      delay: resolveDelayMs,
      progress: 0,
      resolved: false,
      notified: false,
      lens: 0,
      pointer: new Vector2(0.5, 0.5),
      pointerTarget: new Vector2(0.5, 0.5),
      pointerOver: false,
      intersecting: true,
      visible: true,
      contextLost: false,
      disposed: false,
      raf: 0,
      lastTime: 0,
    };

    const uniforms = {
      uTexture: { value: null as Texture | null },
      uTexAspect: { value: 1 },
      uCanvasAspect: { value: 1 },
      uProgress: { value: 0 },
      uPointer: { value: state.pointer },
      uLens: { value: 0 },
      uTime: { value: 0 },
      uInk: { value: ink.vec },
      uPaper: { value: paper.vec },
      uCell: { value: CELL_CSS_PX },
    };

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new PlaneGeometry(2, 2);
    const material = new ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const canRender = () =>
      state.loaded && !state.disposed && !state.contextLost && state.visible;

    const requestFrame = () => {
      if (state.raf !== 0 || !canRender()) return;
      state.raf = window.requestAnimationFrame(frame);
    };

    const cancelFrame = () => {
      if (state.raf !== 0) {
        window.cancelAnimationFrame(state.raf);
        state.raf = 0;
      }
      state.lastTime = 0;
    };

    const frame = (now: number) => {
      state.raf = 0;
      if (!canRender()) return;
      const dt = state.lastTime === 0 ? 1000 / 60 : Math.min(now - state.lastTime, MAX_FRAME_MS);
      state.lastTime = now;
      let busy = false;

      // Resolve clock: counts only while frames run, so an offscreen or hidden
      // canvas holds its place in the development rather than skipping ahead.
      if (!state.resolved) {
        state.elapsed += dt;
        const t =
          resolveDurationMs > 0
            ? clamp01((state.elapsed - state.delay) / resolveDurationMs)
            : 1;
        state.progress = easeInOutCubic(t);
        if (t >= 1) state.resolved = true;
        else busy = true;
      }

      // Lens centre: snap while the lens is invisible so it appears under the
      // pointer, glide while it shows so it never jumps.
      if (state.lens < 0.01) {
        state.pointer.copy(state.pointerTarget);
      } else if (state.pointer.distanceTo(state.pointerTarget) > POINTER_EPSILON) {
        state.pointer.lerp(state.pointerTarget, POINTER_EASE);
        busy = true;
      } else {
        state.pointer.copy(state.pointerTarget);
      }

      // Lens strength eases toward 1 over the parent, 0 off it, after resolve only.
      const lensTarget = state.resolved && state.pointerOver ? 1 : 0;
      const lensDelta = lensTarget - state.lens;
      if (Math.abs(lensDelta) > LENS_EPSILON) {
        state.lens += lensDelta * LENS_EASE;
        busy = true;
      } else {
        state.lens = lensTarget;
      }

      uniforms.uProgress.value = state.progress;
      uniforms.uLens.value = state.lens;
      uniforms.uTime.value = now / 1000;
      renderer.render(scene, camera);

      if (!state.presented) {
        // First frame with the texture is on the backbuffer: safe to show.
        state.presented = true;
        canvas.style.opacity = "1";
      }
      if (state.resolved && !state.notified) {
        state.notified = true;
        onResolvedRef.current?.();
      }

      if (busy) requestFrame();
      else state.lastTime = 0;
    };

    // Size. Backing store follows the parent at a capped DPR; the CSS box is
    // the class's inset-0, so updateStyle is false.
    const resize = () => {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, width < 768 ? 1.5 : 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      uniforms.uCanvasAspect.value = width / height;
      uniforms.uCell.value = Math.max(2, Math.round(CELL_CSS_PX * dpr));
      requestFrame();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);
    resize();

    // Visibility: no frames while the parent is offscreen or the tab is hidden.
    const updateVisibility = () => {
      state.visible = state.intersecting && document.visibilityState === "visible";
      if (state.visible) requestFrame();
      else cancelFrame();
    };
    const intersectionObserver = new IntersectionObserver((entries) => {
      const last = entries[entries.length - 1];
      if (last) state.intersecting = last.isIntersecting;
      updateVisibility();
    });
    intersectionObserver.observe(parent);
    document.addEventListener("visibilitychange", updateVisibility);

    // Pointer. The canvas is pointer-events-none so the parent's links keep
    // working; the parent reports the pointer and the lens follows it.
    const onPointerMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        state.pointerTarget.set(
          (event.clientX - rect.left) / rect.width,
          1 - (event.clientY - rect.top) / rect.height,
        );
      }
      state.pointerOver = true;
      requestFrame();
    };
    const onPointerLeave = () => {
      state.pointerOver = false;
      requestFrame();
    };
    parent.addEventListener("pointermove", onPointerMove, { passive: true });
    parent.addEventListener("pointerenter", onPointerMove, { passive: true });
    parent.addEventListener("pointerleave", onPointerLeave);
    parent.addEventListener("pointercancel", onPointerLeave);

    // Context loss: stop; three rebuilds its own state on restore, we re-render.
    const onContextLost = (event: Event) => {
      event.preventDefault();
      state.contextLost = true;
      cancelFrame();
    };
    const onContextRestored = () => {
      state.contextLost = false;
      requestFrame();
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    let texture: Texture | null = null;

    const dispose = () => {
      if (state.disposed) return;
      state.disposed = true;
      cancelFrame();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
      parent.removeEventListener("pointermove", onPointerMove);
      parent.removeEventListener("pointerenter", onPointerMove);
      parent.removeEventListener("pointerleave", onPointerLeave);
      parent.removeEventListener("pointercancel", onPointerLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      texture?.dispose();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
      // Back to the class's opacity-0 so a src change fades out before the next resolve.
      canvas.style.opacity = "";
    };

    // Texture. Raw encoded bytes, linear filtering, no mipmaps: what is sampled
    // is what the <img> shows.
    texture = new TextureLoader().load(
      src,
      (loaded) => {
        if (state.disposed) return;
        const image: unknown = loaded.image;
        uniforms.uTexAspect.value =
          image instanceof HTMLImageElement && image.naturalHeight > 0
            ? image.naturalWidth / image.naturalHeight
            : 1;
        uniforms.uTexture.value = loaded;
        state.loaded = true;
        state.lastTime = 0;
        // The page clock wins where it is given: whatever is left of the
        // wait, or none if the texture arrived after the moment.
        state.delay =
          resolveAtMs !== undefined
            ? Math.max(0, resolveAtMs - performance.now())
            : resolveDelayMs;
        requestFrame();
      },
      undefined,
      () => {
        // Nothing to develop from: the <img> beneath stays, the canvas stays at 0.
        dispose();
      },
    );
    texture.colorSpace = NoColorSpace;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;

    return dispose;
  }, [src, resolveDelayMs, resolveAtMs, resolveDurationMs]);

  if (reducedMotion || webglUnavailable) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500",
        className,
      )}
    />
  );
}
