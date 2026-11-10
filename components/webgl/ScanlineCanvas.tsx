"use client";

/**
 * ScanlineCanvas — a photograph drawn as a field of horizontal lines.
 *
 * Each line takes its thickness from how dark the picture is beneath it, so
 * a roller and the palms behind it come up as solid bands of green and the
 * sky as nothing at all: a print of the work made with a ruling pen. It is
 * the treatment of the references (a skyline in scanlines at the foot of a
 * white page), applied to a real Sato photograph.
 *
 * Two inputs drive it, both read every frame from a shared ref so the parent
 * can scrub them with GSAP without a React render:
 *
 * - `progress` 0 → 1 resolves the lines into the photograph, a row at a
 *   time, from the top down — the scan finishing.
 * - `rect` is the visible frame inside the canvas: the photograph is fitted
 *   to it, and the lines fade into the page from its top edge.
 *
 * The pointer bends the lines around itself like a lens.
 *
 * Raw three: one full-canvas quad, one draw call. The resolved photograph is
 * written straight from the texture (NoColorSpace, no tone mapping), so it
 * matches the `<img>` beneath. Nothing runs offscreen or in a hidden tab;
 * if WebGL is unavailable `onFail` is called and the `<img>` carries it.
 */

import { useEffect, useRef, type MutableRefObject } from "react";
import {
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
  Vector4,
  WebGLRenderer,
  type Texture,
} from "three";
import { cn } from "@/lib/cn";

export interface ScanlineState {
  progress: number;
  /**
   * The visible frame inside the canvas, in UV (x0, y0, x1, y1, y up). The
   * photograph is fitted to this rectangle, so it scales with the frame as
   * it opens rather than being cropped by it, and the lines fade into the
   * page from its top edge.
   */
  rect: [number, number, number, number];
}

export interface ScanlineCanvasProps {
  src: string;
  state: MutableRefObject<ScanlineState>;
  /** CSS `object-position`-style focal point, 0–1 each axis. */
  focal?: [number, number];
  onReady?: () => void;
  onFail?: () => void;
  className?: string;
}

/** Line pitch in CSS pixels. */
const PERIOD_CSS = 6;

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;
uniform sampler2D uTexture;
uniform vec2 uRes;
uniform float uTexAspect;
uniform vec2 uFocal;
uniform float uPeriod;
uniform float uProgress;
uniform vec4 uRect;
uniform vec2 uPointer;
uniform float uLens;
uniform float uTime;
uniform vec3 uInk;
uniform vec3 uPaper;
varying vec2 vUv;

// UV in the visible frame, then cover-fitted to the frame's own aspect.
vec2 cover(vec2 uv) {
  vec2 size = max(uRect.zw - uRect.xy, vec2(1e-4));
  uv = (uv - uRect.xy) / size;
  float ca = (uRes.x * size.x) / (uRes.y * size.y);
  vec2 s = vec2(1.0);
  if (ca > uTexAspect) s.y = uTexAspect / ca; else s.x = ca / uTexAspect;
  vec2 c = clamp(uFocal, s * 0.5, 1.0 - s * 0.5);
  return (uv - 0.5) * s + c;
}

float hash(float n) { return fract(sin(n * 127.1 + 11.3) * 43758.5453); }

void main() {
  vec2 frag = vUv * uRes;

  // The lens: rows near the pointer are pushed apart, so the lines swell
  // around it as if seen through glass.
  vec2 p = uPointer * uRes;
  vec2 d = frag - p;
  float r = uRes.x * 0.11;
  float infl = exp(-dot(d, d) / (r * r)) * uLens;
  float y = frag.y - d.y * infl * 0.55;

  float row = floor(y / uPeriod);
  float within = fract(y / uPeriod) - 0.5;

  // A slow sideways drift per row while the lines are lines.
  float drift = (hash(row) - 0.5) * 5.0 * sin(uTime * 0.7 + row * 0.37) * (1.0 - uProgress);
  // Five taps along the row, so a line follows shapes rather than grain.
  float px = 1.0 / uRes.x;
  float lum = 0.0;
  for (int i = -2; i <= 2; i++) {
    vec3 tap = texture2D(uTexture, cover(vec2((frag.x + drift) / uRes.x + float(i) * 3.0 * px, ((row + 0.5) * uPeriod) / uRes.y))).rgb;
    lum += dot(tap, vec3(0.2126, 0.7152, 0.0722));
  }
  lum /= 5.0;
  float dark = smoothstep(0.28, 0.82, 1.0 - lum);

  // Fade into the page from the top of the visible frame.
  float frameH = max(uRect.w - uRect.y, 1e-4);
  float fade = smoothstep(uRect.w, uRect.w - frameH * 0.45, vUv.y);
  float thick = dark * fade * 0.94;
  float halfT = thick * 0.5 * uPeriod;
  float dist = abs(within) * uPeriod;
  float ink = (1.0 - smoothstep(halfT - 0.55, halfT + 0.55, dist)) * step(0.03, thick);
  // Deeper ink where the picture is darkest.
  vec3 lineColor = mix(uInk, uInk * 0.62, dark * dark);
  vec3 scan = mix(uPaper, lineColor, ink);

  // The resolve: rows flip to the photograph from the top down, jittered.
  vec3 photo = texture2D(uTexture, cover(vUv)).rgb;
  float rowN = floor(frag.y / uPeriod) / (uRes.y / uPeriod);
  float thr = (1.0 - rowN) * 0.82 + hash(floor(frag.y / uPeriod)) * 0.18;
  float t = uProgress * 1.1 - 0.05;
  float rev = smoothstep(thr - 0.03, thr + 0.03, t);
  // A bright line rides the front of the scan.
  float front = (1.0 - smoothstep(0.0, 0.035, abs(t - thr))) * step(0.001, uProgress) * step(uProgress, 0.999);
  vec3 col = mix(scan, photo, rev);
  col = mix(col, vec3(0.55, 0.77, 0.50), front * 0.55);
  gl_FragColor = vec4(col, 1.0);
}
`;

function readColor(name: string, fallback: string): Vector3 {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  const hex = /^#([0-9a-f]{6})$/i.test(raw) ? raw : fallback;
  const n = parseInt(hex.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

export function ScanlineCanvas({
  src,
  state,
  focal = [0.5, 0.5],
  onReady,
  onFail,
  className,
}: ScanlineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacks = useRef({ onReady, onFail });

  useEffect(() => {
    callbacks.current = { onReady, onFail };
  }, [onReady, onFail]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
    } catch {
      callbacks.current.onFail?.();
      return;
    }

    const paper = readColor("--color-concrete", "#f3f3ef");
    renderer.setClearColor(0xf3f3ef, 1);

    const uniforms = {
      uTexture: { value: null as Texture | null },
      uRes: { value: new Vector2(1, 1) },
      uTexAspect: { value: 1 },
      uFocal: { value: new Vector2(focal[0], 1 - focal[1]) },
      uPeriod: { value: PERIOD_CSS },
      uProgress: { value: 0 },
      uRect: { value: new Vector4(0, 0, 1, 1) },
      uPointer: { value: new Vector2(0.5, 0.5) },
      uLens: { value: 0 },
      uTime: { value: 0 },
      uInk: { value: readColor("--color-brand-bright", "#177b0b") },
      uPaper: { value: paper },
    };

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new PlaneGeometry(2, 2);
    const material = new ShaderMaterial({ uniforms, vertexShader: VERTEX, fragmentShader: FRAGMENT, depthTest: false, depthWrite: false });
    scene.add(new Mesh(geometry, material));

    const local = {
      raf: 0,
      visible: true,
      onScreen: true,
      loaded: false,
      presented: false,
      lens: 0,
      lensTarget: 0,
      pointer: new Vector2(0.5, 0.5),
      pointerTarget: new Vector2(0.5, 0.5),
      start: performance.now(),
      disposed: false,
    };

    const resize = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, w < 768 ? 1.5 : 1.75);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w * dpr, h * dpr);
      uniforms.uPeriod.value = Math.max(3, Math.round(PERIOD_CSS * dpr));
    };

    const frame = (now: number) => {
      local.raf = 0;
      if (local.disposed || !local.loaded || !local.visible || !local.onScreen) return;
      local.lens += (local.lensTarget - local.lens) * 0.08;
      local.pointer.lerp(local.pointerTarget, 0.14);
      uniforms.uLens.value = local.lens;
      uniforms.uPointer.value.copy(local.pointer);
      uniforms.uTime.value = (now - local.start) / 1000;
      uniforms.uProgress.value = state.current.progress;
      const [x0, y0, x1, y1] = state.current.rect;
      uniforms.uRect.value.set(x0, y0, x1, y1);
      renderer.render(scene, camera);
      if (!local.presented) {
        local.presented = true;
        canvas.style.opacity = "1";
        callbacks.current.onReady?.();
      }
      local.raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (!local.raf) local.raf = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(() => {
      resize();
      kick();
    });
    ro.observe(parent);
    resize();

    const io = new IntersectionObserver(([entry]) => {
      local.onScreen = entry.isIntersecting;
      if (local.onScreen) kick();
    });
    io.observe(parent);

    const onVisibility = () => {
      local.visible = document.visibilityState === "visible";
      if (local.visible) kick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      local.pointerTarget.set((event.clientX - rect.left) / rect.width, 1 - (event.clientY - rect.top) / rect.height);
      if (local.lens < 0.02) local.pointer.copy(local.pointerTarget);
      local.lensTarget = 1;
    };
    const onLeave = () => {
      local.lensTarget = 0;
    };
    parent.addEventListener("pointermove", onMove, { passive: true });
    parent.addEventListener("pointerleave", onLeave);

    const onLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(local.raf);
      local.raf = 0;
    };
    const onRestored = () => kick();
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    const loader = new TextureLoader();
    const texture = loader.load(
      src,
      (tex) => {
        if (local.disposed) return;
        const image = tex.image as HTMLImageElement;
        uniforms.uTexAspect.value = image.naturalWidth / Math.max(1, image.naturalHeight);
        uniforms.uTexture.value = tex;
        local.loaded = true;
        kick();
      },
      undefined,
      () => callbacks.current.onFail?.(),
    );
    texture.colorSpace = NoColorSpace;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;

    return () => {
      local.disposed = true;
      cancelAnimationFrame(local.raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      texture.dispose();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
      canvas.style.opacity = "0";
    };
    // `state` is a ref and `focal` is fixed per photograph.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 block h-full w-full opacity-0 transition-opacity duration-700", className)}
    />
  );
}
