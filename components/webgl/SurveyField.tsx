"use client";

/**
 * SurveyField — a live topographic survey drawing behind the home-page motto.
 *
 * A grid of small square points lies on a gently undulating terrain, seen from
 * a low oblique camera, drawn in the brand green on the asphalt band. Points
 * that sit on a contour level light up in the highlight green, so the field
 * reads as a surveyor's levelling model: a contour map that slowly breathes.
 * A pointer over the band raises a smooth bump in the surface, like a probe
 * touching the model, and the contours wrap around it.
 *
 * Why raw `three` rather than react-three-fiber: the whole picture is one
 * `Points` object with one `ShaderMaterial`, so it is one draw call and needs
 * nothing from a scene-graph abstraction. Importing only the classes used keeps
 * the client bundle to three's core plus this file. The terrain, the contour
 * test and the fades are all computed in the vertex shader; the fragment
 * shader only mixes two colours, so a mid-range laptop holds 60 fps.
 *
 * Motion and visibility:
 * - The animation loop runs only while the host element intersects the
 *   viewport, the document is visible and `paused` is false. Otherwise it
 *   stops and restarts when those conditions return.
 * - Under `prefers-reduced-motion: reduce` exactly one static frame is drawn
 *   (fixed time, no drift, no pointer response), and the preference is
 *   re-checked when it changes.
 * - If WebGL is unavailable the component renders nothing and does not throw.
 * - On `webglcontextlost` the loop stops; on `webglcontextrestored` the camera
 *   is re-placed and drawing resumes. Three rebuilds its own GL state.
 */

import { useEffect, useRef, useState, type JSX } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Plane,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { cn } from "@/lib/cn";

export interface SurveyFieldProps {
  /** Applied to the wrapping div. */
  className?: string;
  /** Point grid density. "low" is used under md breakpoints. Default "high". */
  density?: "low" | "high";
  /**
   * Externally pause rendering (e.g. page hidden). The component also pauses
   * itself when offscreen.
   */
  paused?: boolean;
}

/* ------------------------------------------------------------------------ */
/* Tuning                                                                    */
/* ------------------------------------------------------------------------ */

/** Points per axis. The field is wide: width ≈ 2.4 × depth in world units. */
const GRID = { high: { cols: 220, rows: 120 }, low: { cols: 120, rows: 70 } } as const;

/** World extents of the field on the XZ plane, centred at the origin. */
const FIELD_WIDTH = 24;
const FIELD_DEPTH = 10;

/** Camera: vertical field of view and height above the plane, in world units. */
const CAMERA_FOV = 38;
const CAMERA_HEIGHT = 4.2;
/** Where the far edge of the field sits on screen (NDC y, +1 is the top). */
const FAR_EDGE_NDC_Y = 0.95;
/** Where the far corners land on wide frames (NDC x, just past the sides). */
const FAR_CORNER_NDC_X = 1.06;
/**
 * The largest view depth the far edge may have. It is the solution, for the
 * constants above, of "the near edge sits at NDC y = -1.2", i.e. just off the
 * bottom. Frames narrower than about 2.6:1 use it unchanged; wider frames need
 * the far edge closer to fill the width and pull the camera in (and down).
 */
const FAR_DEPTH_MAX = 12.54;

/** Device pixel ratio cap. The points are 2 px; more pixels buy nothing. */
const MAX_DPR = 1.5;
/** Point size in CSS px at the near edge and at the far edge. */
const POINT_SIZE_NEAR = 2.2;
const POINT_SIZE_FAR = 1.2;
/** Contour points are drawn a little larger so the line reads as a line. */
const CONTOUR_SIZE = 1.4;

/** Terrain: amplitude in world units, and noise frequencies per octave. */
const AMPLITUDE = 0.75;
const NOISE_FREQ = [0.11, 0.24, 0.5] as const;
const NOISE_GAIN = [1.0, 0.45, 0.18] as const;
/** Drift speed of the noise's time axis: one noise cell every ~25 s. */
const DRIFT = 0.04;
/** Contour levels per world unit of height. */
const CONTOUR_FREQUENCY = 7;

/** Pointer probe: Gaussian sigma (radius ≈ 2σ ≈ 12% of the width) and height. */
const PROBE_SIGMA = FIELD_WIDTH * 0.06;
const PROBE_HEIGHT = 0.7;

/**
 * Alpha of a non-contour point at the near edge, and what each kind of point
 * fades to at the far edge. The grid is a quiet texture; the contour lines
 * are the drawing, so they keep more of their strength into the distance.
 */
const BASE_ALPHA = 0.26;
const FAR_ALPHA = 0.2;
const CONTOUR_FAR_ALPHA = 0.4;
/**
 * `--color-brand-bright` is darker than `--color-brand-light`, so a contour in
 * it alone would read as a dark line. Lifting it this far toward the point
 * colour keeps it the highlight. 0 uses the token as is.
 */
const CONTOUR_LIFT = 0.6;

/** The frame drawn under reduced motion: any time that gives a pleasant slice. */
const STATIC_TIME = 42;

const FALLBACK_POINT = "#80b076";
const FALLBACK_CONTOUR = "#177b0b";
const FALLBACK_BACKGROUND = "#22272b";

/* ------------------------------------------------------------------------ */
/* Shaders                                                                   */
/* ------------------------------------------------------------------------ */

/** Formats a number as a GLSL float literal. */
const f = (n: number): string => n.toFixed(5);

/**
 * 3D simplex noise, Ian McEwan / Stefan Gustavson (Ashima Arts), MIT licence.
 * The third axis is time, so the surface reshapes in place instead of
 * scrolling past.
 */
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

function vertexShader(stepX: number, stepZ: number): string {
  return /* glsl */ `
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uPointSize;
uniform float uDepthNear;
uniform float uDepthFar;

varying float vLine;
varying float vAlpha;
varying float vLineAlpha;

${NOISE_GLSL}

// Three octaves of noise, each drifting at its own rate along the time axis,
// scaled to world height. The probe is a Gaussian bump under the pointer.
float surface(vec2 p) {
  float t = uTime * ${f(DRIFT)};
  float h = ${f(NOISE_GAIN[0])} * snoise(vec3(p * ${f(NOISE_FREQ[0])}, t));
  h += ${f(NOISE_GAIN[1])} * snoise(vec3(p * ${f(NOISE_FREQ[1])} + 17.3, t * 1.3 + 5.0));
  h += ${f(NOISE_GAIN[2])} * snoise(vec3(p * ${f(NOISE_FREQ[2])} - 9.1, t * 1.7 + 11.0));
  vec2 d = p - uPointer;
  float bump = exp(-dot(d, d) * ${f(1 / (2 * PROBE_SIGMA * PROBE_SIGMA))});
  return h * ${f(AMPLITUDE)} + bump * uPointerStrength * ${f(PROBE_HEIGHT)};
}

void main() {
  vec2 p = position.xz;
  float h = surface(p);

  // Contour test. A varying is constant across a point sprite, so fwidth()
  // cannot measure the local slope here; the height at the two grid
  // neighbours gives it instead. rise is the height change to the next
  // point, in contour units. A level crosses between two neighbours and the
  // nearer one is within half a step of it, so everything under 0.5 lights
  // fully and the line is never broken; the soft shoulder past it lets the
  // other neighbour join where the crossing is near the middle.
  float hx = surface(p + vec2(${f(stepX)}, 0.0));
  float hz = surface(p + vec2(0.0, ${f(stepZ)}));
  float rise = max(abs(hx - h), abs(hz - h)) * ${f(CONTOUR_FREQUENCY)};
  rise = clamp(rise, 0.03, 0.5);
  float c = fract(h * ${f(CONTOUR_FREQUENCY)});
  float dist = min(c, 1.0 - c) / rise;
  float line = 1.0 - smoothstep(0.5, 0.8, dist);
  vLine = line;

  vec4 mv = modelViewMatrix * vec4(p.x, h, p.y, 1.0);
  float depth = -mv.z;
  gl_Position = projectionMatrix * mv;

  // Far points are smaller and fainter; the sides dissolve in screen space so
  // the field never ends in a hard rectangle at any aspect ratio.
  float far = smoothstep(uDepthNear, uDepthFar, depth);
  float size = uPointSize * mix(1.0, ${f(POINT_SIZE_FAR / POINT_SIZE_NEAR)}, far);
  gl_PointSize = size * mix(1.0, ${f(CONTOUR_SIZE)}, line);
  float ndcX = gl_Position.x / max(gl_Position.w, 0.0001);
  float edge = 1.0 - 0.92 * smoothstep(0.55, 1.0, abs(ndcX));
  vAlpha = ${f(BASE_ALPHA)} * mix(1.0, ${f(FAR_ALPHA)}, far) * edge;
  vLineAlpha = mix(1.0, ${f(CONTOUR_FAR_ALPHA)}, far) * edge;
}
`;
}

const FRAGMENT_SHADER = /* glsl */ `
uniform vec3 uPointColor;
uniform vec3 uContourColor;

varying float vLine;
varying float vAlpha;
varying float vLineAlpha;

void main() {
  // Square points: no rounding, no discard.
  vec3 color = mix(uPointColor, uContourColor, vLine);
  float alpha = mix(vAlpha, vLineAlpha, vLine);
  gl_FragColor = vec4(color, alpha);
  #include <colorspace_fragment>
}
`;

/* ------------------------------------------------------------------------ */
/* Helpers                                                                   */
/* ------------------------------------------------------------------------ */

/** Reads a hex colour token off `:root`, falling back when it is not hex. */
function readToken(name: string, fallback: string): Color {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const hex = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : fallback;
  return new Color(hex);
}

/** Builds the flat grid. Height is added in the vertex shader. */
function buildGeometry(cols: number, rows: number): BufferGeometry {
  const positions = new Float32Array(cols * rows * 3);
  let k = 0;
  for (let j = 0; j < rows; j += 1) {
    const z = (j / (rows - 1) - 0.5) * FIELD_DEPTH;
    for (let i = 0; i < cols; i += 1) {
      positions[k] = (i / (cols - 1) - 0.5) * FIELD_WIDTH;
      positions[k + 1] = 0;
      positions[k + 2] = z;
      k += 3;
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  return geometry;
}

/**
 * Places the camera for an aspect ratio and returns the view depths of the
 * near and far edges (the fade range).
 *
 * The far edge of the field is pinned to a fixed height on screen. Its view
 * depth `d` is the one that puts the far corners just past the sides of the
 * frame, capped so that the near edge stays off the bottom (see
 * FAR_DEPTH_MAX). In camera space the far edge's centre is then at
 * (depth d, height y = FAR_EDGE_NDC_Y · d · tan(fov/2)); the camera-to-edge
 * vector has the same length in world space, sqrt(L² + h²) with h the camera
 * height, which gives the horizontal distance L and from that the pitch.
 */
function placeCamera(camera: PerspectiveCamera, aspect: number): { near: number; far: number } {
  const tanHalf = Math.tan((CAMERA_FOV * Math.PI) / 360);
  const fillDepth = FIELD_WIDTH / 2 / (FAR_CORNER_NDC_X * tanHalf * aspect);
  const far = Math.min(fillDepth, FAR_DEPTH_MAX);
  const yFar = FAR_EDGE_NDC_Y * far * tanHalf;
  const h = CAMERA_HEIGHT;
  const horizontal = Math.sqrt(Math.max(far * far + yFar * yFar - h * h, 0));
  const pitch = Math.atan2(h * far + horizontal * yFar, horizontal * far - h * yFar);
  const z = horizontal - FIELD_DEPTH / 2;

  camera.aspect = aspect;
  camera.position.set(0, h, z);
  camera.rotation.set(-pitch, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  const near = h * Math.sin(pitch) + (z - FIELD_DEPTH / 2) * Math.cos(pitch);
  return { near: Math.max(near, 0.5), far };
}

interface Field {
  /** Re-evaluates whether the loop should run (or, reduced, draws a frame). */
  sync: () => void;
  dispose: () => void;
}

/** Everything that owns a WebGL context, built once per mount. */
function createField(
  host: HTMLDivElement,
  canvas: HTMLCanvasElement,
  density: "low" | "high",
  isPaused: () => boolean,
): Field | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
  } catch {
    return null;
  }

  const background = readToken("--color-asphalt", FALLBACK_BACKGROUND);
  renderer.setClearColor(background, 1);

  const { cols, rows } = GRID[density];
  const geometry = buildGeometry(cols, rows);
  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new Vector2(0, 0) },
    uPointerStrength: { value: 0 },
    uPointSize: { value: POINT_SIZE_NEAR },
    uDepthNear: { value: 1 },
    uDepthFar: { value: FAR_DEPTH_MAX },
    uPointColor: { value: readToken("--color-brand-light", FALLBACK_POINT) },
    uContourColor: { value: readToken("--color-brand-bright", FALLBACK_CONTOUR) },
  };
  uniforms.uContourColor.value.lerp(uniforms.uPointColor.value, CONTOUR_LIFT);

  const material = new ShaderMaterial({
    uniforms,
    vertexShader: vertexShader(FIELD_WIDTH / (cols - 1), FIELD_DEPTH / (rows - 1)),
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });

  const points = new Points(geometry, material);
  points.frustumCulled = false; // the shader displaces it; it is always in view
  const scene = new Scene();
  scene.add(points);
  const camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.5, 80);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const raycaster = new Raycaster();
  const ground = new Plane(new Vector3(0, 1, 0), 0);
  const ndc = new Vector2();
  const hit = new Vector3();
  const pointerTarget = new Vector2();
  let strengthTarget = 0;

  let rafId = 0;
  let last = 0;
  let dpr = 0;
  let shown = false;
  let intersecting = false;
  let contextLost = false;

  const render = (): void => {
    if (contextLost) return;
    renderer.render(scene, camera);
    if (!shown) {
      shown = true;
      canvas.style.opacity = "1";
    }
  };

  const renderStatic = (): void => {
    uniforms.uTime.value = STATIC_TIME;
    uniforms.uPointerStrength.value = 0;
    render();
  };

  const resize = (): void => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (width === 0 || height === 0) return;
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    uniforms.uPointSize.value = POINT_SIZE_NEAR * dpr;
    const depths = placeCamera(camera, width / height);
    uniforms.uDepthNear.value = depths.near;
    uniforms.uDepthFar.value = depths.far;
    if (reduceMotion.matches) renderStatic();
    else if (rafId === 0) render();
  };

  const frame = (now: number): void => {
    rafId = window.requestAnimationFrame(frame);
    // Clamp the step so a long stall (tab switch, resume) cannot jump the probe.
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    uniforms.uTime.value += dt;

    // Ease the probe in and out, and let it glide toward the pointer. When
    // the bump is gone, snap to the new position so it does not slide in from
    // where the pointer last left.
    const strength = uniforms.uPointerStrength.value;
    const rate = strengthTarget > strength ? 6 : 2.5;
    uniforms.uPointerStrength.value = strength + (strengthTarget - strength) * (1 - Math.exp(-dt * rate));
    if (strength < 0.01 && strengthTarget > 0) uniforms.uPointer.value.copy(pointerTarget);
    else uniforms.uPointer.value.lerp(pointerTarget, 1 - Math.exp(-dt * 12));

    if (Math.min(window.devicePixelRatio || 1, MAX_DPR) !== dpr) resize();
    render();
  };

  const start = (): void => {
    if (rafId !== 0) return;
    last = performance.now();
    rafId = window.requestAnimationFrame(frame);
  };

  const stop = (): void => {
    if (rafId === 0) return;
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  };

  const sync = (): void => {
    if (contextLost) {
      stop();
      return;
    }
    if (reduceMotion.matches) {
      stop();
      renderStatic();
      return;
    }
    const visible = intersecting && !isPaused() && document.visibilityState === "visible";
    if (visible) start();
    else stop();
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (reduceMotion.matches) return;
    const rect = host.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    ndc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, camera);
    if (raycaster.ray.intersectPlane(ground, hit) !== null) {
      pointerTarget.set(hit.x, hit.z);
      strengthTarget = 1;
    }
  };

  const release = (): void => {
    strengthTarget = 0;
  };

  const onPointerUp = (event: PointerEvent): void => {
    // A lifted finger has left the model; a mouse is still over it.
    if (event.pointerType !== "mouse") release();
  };

  const onContextLost = (event: Event): void => {
    event.preventDefault();
    contextLost = true;
    stop();
  };

  const onContextRestored = (): void => {
    contextLost = false;
    resize();
    sync();
  };

  const onVisibility = (): void => sync();
  const onMotionChange = (): void => sync();

  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      intersecting = entries.some((entry) => entry.isIntersecting);
      sync();
    },
    { threshold: 0 },
  );

  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);
  host.addEventListener("pointermove", onPointerMove);
  host.addEventListener("pointerleave", release);
  host.addEventListener("pointercancel", release);
  host.addEventListener("pointerup", onPointerUp);
  document.addEventListener("visibilitychange", onVisibility);
  reduceMotion.addEventListener("change", onMotionChange);
  resizeObserver.observe(host);
  intersectionObserver.observe(host);

  resize();

  const dispose = (): void => {
    stop();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", onContextRestored);
    host.removeEventListener("pointermove", onPointerMove);
    host.removeEventListener("pointerleave", release);
    host.removeEventListener("pointercancel", release);
    host.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("visibilitychange", onVisibility);
    reduceMotion.removeEventListener("change", onMotionChange);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };

  return { sync, dispose };
}

/* ------------------------------------------------------------------------ */
/* Component                                                                 */
/* ------------------------------------------------------------------------ */

export function SurveyField({ className, density = "high", paused = false }: SurveyFieldProps): JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const syncRef = useRef<(() => void) | null>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    pausedRef.current = paused;
    syncRef.current?.();
  }, [paused]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const field = createField(host, canvas, density, () => pausedRef.current);
    if (!field) {
      setSupported(false);
      return;
    }
    syncRef.current = field.sync;
    return () => {
      syncRef.current = null;
      field.dispose();
    };
  }, [density]);

  return (
    <div ref={hostRef} className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {supported ? (
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          style={{ opacity: 0, transition: "opacity 600ms ease-out", touchAction: "pan-y" }}
        />
      ) : null}
    </div>
  );
}
