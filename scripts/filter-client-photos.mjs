#!/usr/bin/env node
/**
 * Step 3 of docs/decisions/client-photos.md: cut the working set down to
 * candidates before anyone looks at a photograph.
 *
 * Reads _work/all-manifest.json (written by extract-client-photos.mjs) and,
 * in this order:
 *
 *   1. near-duplicates  — 64-bit DCT perceptual hash; photographs within
 *                         DUP_DISTANCE bits are one group, and the group keeps
 *                         its largest (then sharpest) member
 *   2. size             — long edge < 800px dropped; 800–1199px kept but
 *                         flagged "gallery only, too small for headers"
 *   3. blur             — variance of the Laplacian at a fixed 1024px long
 *                         edge; the bottom fifth is dropped
 *   4. non-photographs  — documents, drawings, screenshots and mostly-text
 *                         images: a lot of paper-white, flat blocks and little
 *                         colour
 *
 * Writes _work/filter-report.json and a 480px thumbnail per image in
 * _work/thumbs/, plus labelled contact sheets of the candidates in
 * _work/sheets/ for the visual review.
 *
 *   node scripts/filter-client-photos.mjs
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const BASE = join(ROOT, "raw-assets", "client-photos");
const WORK = join(BASE, "_work");

const DUP_DISTANCE = 10; // of 64 bits
const HEADER_MIN = 1200;
const GALLERY_MIN = 800;
const BLUR_FRACTION = 0.2;

const { photos } = JSON.parse(readFileSync(join(WORK, "all-manifest.json"), "utf8"));

/* ---------- measurements ---------- */

// 32x32 greyscale → 2D DCT → top-left 8x8 (minus DC) against its median.
const COS = Array.from({ length: 32 }, (_, k) => Array.from({ length: 32 }, (_, n) => Math.cos(((2 * n + 1) * k * Math.PI) / 64)));
async function pHash(file) {
  const px = await sharp(file).greyscale().resize(32, 32, { fit: "fill" }).raw().toBuffer();
  const rows = Array.from({ length: 32 }, (_, y) => Array.from({ length: 8 }, (_, u) => { let s = 0; for (let x = 0; x < 32; x++) s += px[y * 32 + x] * COS[u][x]; return s; }));
  const coef = [];
  for (let v = 0; v < 8; v++) for (let u = 0; u < 8; u++) { let s = 0; for (let y = 0; y < 32; y++) s += rows[y][u] * COS[v][y]; coef.push(s); }
  const ac = coef.slice(1);
  const med = [...ac].sort((a, b) => a - b)[Math.floor(ac.length / 2)];
  return coef.map((c) => (c > med ? 1 : 0)).join("");
}
const hamming = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d; };

async function analyse(file) {
  const { data, info } = await sharp(file).resize(1024, 1024, { fit: "inside" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const N = w * h;
  const g = new Float32Array(N);
  let white = 0, rg = 0, yb = 0, rg2 = 0, yb2 = 0, sat = 0;
  for (let i = 0; i < N; i++) {
    const r = data[i * 3], gg = data[i * 3 + 1], b = data[i * 3 + 2];
    g[i] = 0.299 * r + 0.587 * gg + 0.114 * b;
    const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
    const s = mx ? (mx - mn) / mx : 0;
    sat += s;
    if (g[i] > 225 && s < 0.12) white++;
    const a = r - gg, c = 0.5 * (r + gg) - b;
    rg += a; yb += c; rg2 += a * a; yb2 += c * c;
  }
  // Variance of the Laplacian.
  let lsum = 0, lsq = 0, ln = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const l = g[i - w] + g[i + w] + g[i - 1] + g[i + 1] - 4 * g[i];
    lsum += l; lsq += l * l; ln++;
  }
  const lap = lsq / ln - (lsum / ln) ** 2;
  // Flat 8x8 blocks: rendered UI and paper are full of them, photographs are not.
  let flat = 0, blocks = 0;
  for (let by = 0; by + 8 <= h; by += 8) for (let bx = 0; bx + 8 <= w; bx += 8) {
    let s = 0, s2 = 0;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const v = g[(by + y) * w + bx + x]; s += v; s2 += v * v; }
    if (s2 / 64 - (s / 64) ** 2 < 2) flat++;
    blocks++;
  }
  const sd = (s, s2) => Math.sqrt(Math.max(0, s2 / N - (s / N) ** 2));
  const colourfulness = Math.sqrt(sd(rg, rg2) ** 2 + sd(yb, yb2) ** 2) + 0.3 * Math.sqrt((rg / N) ** 2 + (yb / N) ** 2);
  return { laplacianVar: Math.round(lap), whiteFrac: +(white / N).toFixed(3), flatFrac: +(flat / blocks).toFixed(3), colourfulness: +colourfulness.toFixed(1), meanSat: +(sat / N).toFixed(3) };
}

/* ---------- run ---------- */

rmSync(join(WORK, "thumbs"), { recursive: true, force: true });
rmSync(join(WORK, "sheets"), { recursive: true, force: true });
mkdirSync(join(WORK, "thumbs"), { recursive: true });
mkdirSync(join(WORK, "sheets"), { recursive: true });

const rows = [];
for (const p of photos) {
  const file = join(BASE, p.workFile);
  const [hash, m] = await Promise.all([pHash(file), analyse(file)]);
  await sharp(file).resize(480, 480, { fit: "inside" }).jpeg({ quality: 78 }).toFile(join(WORK, "thumbs", `${p.id}.jpg`));
  rows.push({ ...p, longEdge: Math.max(p.width, p.height), hash, ...m, status: "candidate", reasons: [], flags: [] });
}

// 1. Near-duplicates: single-link grouping by Hamming distance.
const groupOf = new Map();
let groups = 0;
for (let i = 0; i < rows.length; i++) {
  if (groupOf.has(i)) continue;
  const stack = [i];
  groupOf.set(i, groups);
  while (stack.length) {
    const a = stack.pop();
    for (let j = 0; j < rows.length; j++) if (!groupOf.has(j) && hamming(rows[a].hash, rows[j].hash) <= DUP_DISTANCE) { groupOf.set(j, groups); stack.push(j); }
  }
  groups++;
}
const byGroup = new Map();
rows.forEach((r, i) => { const gid = groupOf.get(i); if (!byGroup.has(gid)) byGroup.set(gid, []); byGroup.get(gid).push(r); });
for (const members of byGroup.values()) {
  if (members.length < 2) continue;
  // An original beats a copy recovered from a metafile at the same size (16-bit colour).
  members.sort((a, b) => b.longEdge - a.longEdge || Number(Boolean(a.convertedFrom)) - Number(Boolean(b.convertedFrom)) || b.laplacianVar - a.laplacianVar);
  const keep = members[0];
  keep.duplicates = members.slice(1).map((m) => m.id);
  for (const m of members.slice(1)) { m.status = "dropped"; m.reasons.push(`near-duplicate of ${keep.id} (distance ${hamming(m.hash, keep.hash)})`); m.duplicateOf = keep.id; }
}
const afterDup = rows.filter((r) => r.status === "candidate");

// 2. Size.
for (const r of afterDup) {
  if (r.longEdge < GALLERY_MIN) { r.status = "dropped"; r.reasons.push(`too small: ${r.longEdge}px long edge`); }
  else if (r.longEdge < HEADER_MIN) r.flags.push(`gallery only: ${r.longEdge}px long edge, too small for headers`);
}
const afterSize = afterDup.filter((r) => r.status === "candidate");

// 3. Blur: bottom fifth of what is left.
const sorted = [...afterSize].sort((a, b) => a.laplacianVar - b.laplacianVar);
const cut = Math.floor(sorted.length * BLUR_FRACTION);
const blurThreshold = sorted[cut]?.laplacianVar ?? 0;
for (const r of sorted.slice(0, cut)) { r.status = "dropped"; r.reasons.push(`blurry: Laplacian variance ${r.laplacianVar} (bottom fifth, threshold ${blurThreshold})`); }
const afterBlur = afterSize.filter((r) => r.status === "candidate");

// 4. Non-photographs.
for (const r of afterBlur) {
  const paper = r.whiteFrac > 0.45 && r.meanSat < 0.12;
  const rendered = r.flatFrac > 0.5 && r.colourfulness < 18;
  if (paper || rendered) { r.status = "dropped"; r.reasons.push(`not a photograph: ${paper ? `paper-white ${Math.round(r.whiteFrac * 100)}%` : ""}${paper && rendered ? ", " : ""}${rendered ? `flat blocks ${Math.round(r.flatFrac * 100)}%, colourfulness ${r.colourfulness}` : ""}`); }
}
const candidates = afterBlur.filter((r) => r.status === "candidate");

const counts = { total: rows.length, afterDuplicates: afterDup.length, afterSize: afterSize.length, afterBlur: afterBlur.length, candidates: candidates.length, galleryOnly: candidates.filter((r) => r.flags.length).length, blurThreshold };
writeFileSync(join(WORK, "filter-report.json"), JSON.stringify({ generated: new Date().toISOString(), counts, photos: rows.map((r) => { const { hash, ...rest } = r; void hash; return rest; }) }, null, 2));

/* ---------- contact sheets ---------- */

async function sheet(list, name, perSheet = 12, cols = 4) {
  const W = 480, H = 360, LAB = 34;
  for (let s = 0; s * perSheet < list.length; s++) {
    const page = list.slice(s * perSheet, (s + 1) * perSheet);
    const rowsN = Math.ceil(page.length / cols);
    const comps = [];
    for (const [k, r] of page.entries()) {
      const x = (k % cols) * W, y = Math.floor(k / cols) * (H + LAB);
      const img = await sharp(join(WORK, "thumbs", `${r.id}.jpg`)).resize(W, H, { fit: "contain", background: "#222" }).toBuffer();
      const label = `${r.id} · ${r.width}×${r.height} · ${(r.originalPath.split("/").pop() || "").slice(0, 30)}`;
      const svg = `<svg width="${W}" height="${LAB}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#111"/><text x="8" y="23" font-family="Helvetica" font-size="17" fill="#ffd400">${label.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text></svg>`;
      comps.push({ input: img, left: x, top: y }, { input: Buffer.from(svg), left: x, top: y + H });
    }
    await sharp({ create: { width: cols * W, height: rowsN * (H + LAB), channels: 3, background: "#000" } }).composite(comps).jpeg({ quality: 80 }).toFile(join(WORK, "sheets", `${name}-${String(s + 1).padStart(2, "0")}.jpg`));
  }
}
await sheet(candidates, "candidates");
await sheet(rows.filter((r) => r.status === "dropped" && !r.duplicateOf), "dropped");
await sheet(rows.filter((r) => r.duplicateOf), "duplicates");

console.log(`total ${counts.total} → after duplicates ${counts.afterDuplicates} → after size ${counts.afterSize} → after blur ${counts.afterBlur} → candidates ${counts.candidates} (${counts.galleryOnly} gallery-only)`);
